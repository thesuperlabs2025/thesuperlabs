import express from "express";
import db from "../db.js";

const router = express.Router();

/* ================= SUMMARY STATS ================= */
router.get("/summary-stats", (req, res) => {
  const yearId = req.headers['x-year-id'];
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM order_planning WHERE status = 'Approved' AND year_id = ?) as totalOrders,
      (SELECT COUNT(*) FROM tna_headers WHERE status = 'In Progress' AND year_id = ?) as inProduction,
      (SELECT COUNT(DISTINCT order_no) FROM (
          SELECT order_no FROM pcs_inward WHERE (process LIKE '%Packing%' OR process LIKE '%Dispatch%') AND year_id = ?
          GROUP BY order_no, process
          HAVING SUM(total_pcs) >= (SELECT IFNULL(SUM(total_qty), 1) FROM (
              SELECT order_no, process, total_pcs as total_qty FROM pcs_outward WHERE year_id = ?
              UNION ALL SELECT order_no, process, total_qty FROM fabric_to_pcs_outward WHERE year_id = ?
              UNION ALL SELECT order_no, process, total_qty FROM yarn_dyeing_outward WHERE year_id = ?
          ) as all_out WHERE all_out.order_no = pcs_inward.order_no AND all_out.process = pcs_inward.process LIMIT 1)
      ) as packed) as readyForDispatch,
      (SELECT COUNT(*) FROM order_planning WHERE factory_date < CURDATE() AND status != 'Completed' AND status != 'Shipped' AND year_id = ?) as delayedOrders
  `;
  db.query(sql, [yearId, yearId, yearId, yearId, yearId, yearId, yearId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

/* ================= PRODUCTION SUMMARY ================= */
router.get("/production-summary", (req, res) => {
  const yearId = req.headers['x-year-id'];
  const sql = `
    SELECT 
      (SELECT IFNULL(SUM(total_pcs), 0) FROM pcs_inward WHERE (process LIKE '%Packing%' OR process LIKE '%Dispatch%') AND year_id = ?) as totalProduction,
      (SELECT IFNULL(SUM(total_pcs), 0) FROM pcs_inward WHERE year_id = ?) as totalInward,
      (SELECT COUNT(*) FROM tna_processes tp JOIN tna_headers th ON tp.tna_id = th.id WHERE tp.status != 'Completed' AND tp.due_date < CURDATE() AND th.year_id = ?) as productionDelayAlerts
  `;
  db.query(sql, [yearId, yearId, yearId], (err, result) => {
    if (err) return res.status(500).json(err);

    let data = result[0];
    data.wipQuantity = Math.max(0, data.totalInward - (data.totalProduction * 1.5));
    res.json(data);
  });
});

/* ================= ORDER PIPELINE ================= */
router.get("/order-pipeline", (req, res) => {
  const yearId = req.headers['x-year-id'];
  const sql = `
    SELECT 
      op.id as order_id, op.order_no, op.order_name, op.style_type as style_name,
      lc.process_name, lc.sequence_no,
      (
        SELECT IFNULL(SUM(qty), 0) FROM (
          SELECT order_no, process, total_pcs as qty, year_id FROM pcs_inward
          UNION ALL SELECT order_no, process, total_qty as qty, year_id FROM fabric_to_pcs_inward
          UNION ALL SELECT order_no, process, total_qty as qty, year_id FROM yarn_dyeing_inward
          UNION ALL SELECT j.order_no, jp.process_name as process, ji.received_weight as qty, j.year_id 
          FROM job_inward j JOIN job_inward_items ji ON ji.inward_id = j.id JOIN job_inward_item_processes jp ON jp.item_id = ji.id
        ) as all_in 
        WHERE all_in.order_no = op.order_no AND all_in.process = lc.process_name AND all_in.year_id = ?
      ) as inward_qty,
      (
        SELECT IFNULL(SUM(qty), 0) FROM (
          SELECT order_no, process, total_pcs as qty, year_id FROM pcs_outward
          UNION ALL SELECT order_no, process, total_qty as qty, year_id FROM fabric_to_pcs_outward
          UNION ALL SELECT order_no, process, total_qty as qty, year_id FROM yarn_dyeing_outward
          UNION ALL SELECT j.order_no, jp.process_name as process, ji.outward_weight as qty, j.year_id 
          FROM job_outward j JOIN job_outward_items ji ON ji.outward_id = j.id JOIN job_outward_item_processes jp ON jp.outward_item_id = ji.id
        ) as all_out
        WHERE all_out.order_no = op.order_no AND all_out.process = lc.process_name AND all_out.year_id = ?
      ) as target_qty,
      (SELECT tp.status FROM tna_processes tp JOIN tna_headers th ON tp.tna_id = th.id WHERE th.order_no = op.order_no AND tp.process_name = lc.process_name AND th.year_id = ? LIMIT 1) as tna_status
    FROM order_planning op
    JOIN order_lifecycle lc ON lc.order_id = op.id
    WHERE (op.status = 'Approved' OR op.status = 'In Progress') AND op.year_id = ?
    ORDER BY op.id, lc.sequence_no
  `;

  db.query(sql, [yearId, yearId, yearId, yearId], (err, rows) => {
    if (err) return res.status(500).json(err);

    const ordersMap = rows.reduce((acc, curr) => {
      if (!acc[curr.order_no]) {
        acc[curr.order_no] = {
          order_no: curr.order_no,
          style_name: curr.order_name,
          steps: []
        };
      }

      const inQty = parseFloat(curr.inward_qty) || 0;
      const targetQty = parseFloat(curr.target_qty) || 0;
      let status = curr.tna_status || 'Not Started';

      // Precision status based on quantities
      if (targetQty > 0) {
        if (inQty >= targetQty * 0.98) status = 'Completed'; // 98% tolerance
        else if (inQty > 0) status = 'In Progress';
      } else if (inQty > 0) {
        // If we have inward but unknown outward target, default to In Progress unless TNA says Completed
        if (status !== 'Completed') status = 'In Progress';
      }

      const unit = (
        curr.process_name.toLowerCase().includes('yarn') ||
        curr.process_name.toLowerCase().includes('knit') ||
        curr.process_name.toLowerCase().includes('dye') ||
        curr.process_name.toLowerCase().includes('fabric') ||
        curr.process_name.toLowerCase().includes('compact')
      ) ? 'Kgs' : 'Pcs';

      acc[curr.order_no].steps.push({
        name: curr.process_name,
        seq: curr.sequence_no,
        in_qty: inQty,
        target_qty: targetQty,
        status: status,
        unit: unit
      });

      return acc;
    }, {});

    const result = Object.values(ordersMap).map(order => {
      const steps = order.steps.sort((a, b) => a.seq - b.seq);

      let totalStepProgress = 0;
      steps.forEach(s => {
        if (s.status === 'Completed') {
          totalStepProgress += 1;
        } else if (s.status === 'In Progress') {
          const ratio = s.target_qty > 0 ? (s.in_qty / s.target_qty) : 0.5;
          totalStepProgress += Math.min(0.9, ratio); // Cap in-progress step at 90%
        }
      });

      const percentage = Math.round((totalStepProgress / steps.length) * 100);

      // Current step: the first one that is NOT completed
      const currentStep = steps.find(s => s.status !== 'Completed') || steps[steps.length - 1];

      return {
        ...order,
        steps: steps,
        percentage: Math.min(percentage, 100),
        current_step: currentStep ? currentStep.name : 'Finished'
      };
    });

    res.json(result);
  });
});

/* ================= TASK DISTRIBUTION ================= */
router.get("/task-distribution", (req, res) => {
  const yearId = req.headers['x-year-id'];
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM tna_processes tp JOIN tna_headers th ON tp.tna_id = th.id WHERE tp.status != 'Completed' AND tp.due_date < CURDATE() AND th.year_id = ?) as overdueTasks,
      (SELECT COUNT(*) FROM tna_processes tp JOIN tna_headers th ON tp.tna_id = th.id WHERE tp.status = 'Completed' AND DATE(tp.completion_date) = CURDATE() AND th.year_id = ?) as completedToday,
      tp.assigned_member_name, tp.status, COUNT(*) as count
    FROM tna_processes tp
    JOIN tna_headers th ON tp.tna_id = th.id
    WHERE th.year_id = ?
    GROUP BY tp.assigned_member_name, tp.status
  `;
  db.query(sql, [yearId, yearId, yearId], (err, rows) => {
    if (err) return res.status(500).json(err);

    const overdue = rows[0]?.overdueTasks || 0;
    const completedToday = rows[0]?.completedToday || 0;

    const employeeStats = rows.reduce((acc, curr) => {
      if (!curr.assigned_member_name) return acc;
      if (!acc[curr.assigned_member_name]) acc[curr.assigned_member_name] = { name: curr.assigned_member_name, completed: 0, pending: 0, delayed: 0 };

      if (curr.status === 'Completed') acc[curr.assigned_member_name].completed += curr.count;
      else if (curr.status === 'Delayed') acc[curr.assigned_member_name].delayed += curr.count;
      else acc[curr.assigned_member_name].pending += curr.count;

      return acc;
    }, {});

    res.json({
      overdueTasks: overdue,
      completedToday: completedToday,
      employeeStats: Object.values(employeeStats)
    });
  });
});

/* ================= DEADLINES ================= */
router.get("/deadlines", (req, res) => {
  const yearId = req.headers['x-year-id'];
  const sql = `
    SELECT id, order_no, order_name, factory_date, delivery_date,
    CASE 
      WHEN factory_date < CURDATE() THEN 'Delayed'
      WHEN factory_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Due this week'
      ELSE 'Upcoming'
    END as deadline_status
    FROM order_planning
    WHERE (factory_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) OR factory_date < CURDATE())
    AND status != 'Completed' AND year_id = ?
    ORDER BY factory_date ASC
  `;
  db.query(sql, [yearId], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/* ================= SMART INSIGHTS ================= */
router.get("/insights", (req, res) => {
  const yearId = req.headers['x-year-id'];
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM tna_processes tp JOIN tna_headers th ON tp.tna_id = th.id WHERE tp.status = 'Completed' AND tp.completion_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND th.year_id = ?) as last_week_prod,
      (SELECT COUNT(*) FROM tna_processes tp JOIN tna_headers th ON tp.tna_id = th.id WHERE tp.status = 'Completed' AND tp.completion_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) AND tp.completion_date < DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND th.year_id = ?) as prev_week_prod,
      (SELECT GROUP_CONCAT(product_name) FROM products WHERE current_stock <= minimum_stock LIMIT 1) as low_stock_items,
      (SELECT GROUP_CONCAT(i.customer_name) FROM invoices i LEFT JOIN receipts r ON i.customer_name = r.customer_name WHERE i.invoice_date < DATE_SUB(CURDATE(), INTERVAL 45 DAY) AND (i.grand_total - IFNULL(r.TransactionAmount, 0)) > 0 AND i.year_id = ? LIMIT 1) as overdue_customers
  `;

  db.query(sql, [yearId, yearId, yearId], (err, rows) => {
    if (err) return res.status(500).json(err);

    const data = rows[0];
    const insights = [];

    if (data.last_week_prod < data.prev_week_prod) {
      const drop = data.prev_week_prod > 0 ? Math.round(((data.prev_week_prod - data.last_week_prod) / data.prev_week_prod) * 100) : 0;
      insights.push(`Production efficiency dropped ${drop}% this week`);
    } else {
      insights.push(`Production efficiency increased this week`);
    }

    if (data.low_stock_items) {
      insights.push(`Stock for ${data.low_stock_items.split(',')[0]} is reaching minimum levels`);
    }

    if (data.overdue_customers) {
      insights.push(`Customer ${data.overdue_customers.split(',')[0]} has pending payments over 45 days`);
    }

    res.json(insights);
  });
});

/* ================= ACCOUNTS & FINANCE COUNTS ================= */
router.get("/accounts-counts", (req, res) => {
  const yearId = req.headers['x-year-id'];
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM invoices WHERE year_id = ?) as invoice,
      (SELECT COUNT(*) FROM receipts WHERE year_id = ?) as receipt,
      (SELECT COUNT(*) FROM purchases WHERE year_id = ?) as purchase,
      (SELECT COUNT(*) FROM vouchers WHERE year_id = ?) as voucher,
      (SELECT COUNT(*) FROM quotation WHERE year_id = ?) as quotation,
      (SELECT COUNT(*) FROM pi WHERE year_id = ?) as pi,
      (SELECT COUNT(*) FROM po WHERE year_id = ?) as po,
      (SELECT COUNT(*) FROM grn WHERE year_id = ?) as grn,
      (SELECT COUNT(*) FROM dc WHERE year_id = ?) as dc,
      (SELECT COUNT(*) FROM estimate WHERE year_id = ?) as estimate,
      (SELECT COUNT(*) FROM sales_return WHERE year_id = ?) as salesReturn,
      (SELECT COUNT(*) FROM credit_note WHERE year_id = ?) as creditNote,
      (SELECT COUNT(*) FROM purchase_return WHERE year_id = ?) as purchaseReturn,
      (SELECT COUNT(*) FROM debit_note WHERE year_id = ?) as debitNote
  `;
  db.query(sql, Array(14).fill(yearId), (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

export default router;
