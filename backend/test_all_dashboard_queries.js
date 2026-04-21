
import db from "./db.js";

async function test(name, sql) {
    return new Promise((resolve) => {
        db.query(sql, (err, result) => {
            if (err) {
                console.error(`ERROR in ${name}:`, err);
                resolve({ name, status: 'error', error: err });
            } else {
                console.log(`SUCCESS in ${name}`);
                resolve({ name, status: 'success' });
            }
        });
    });
}

const queries = {
    'summary-stats': `
        SELECT 
          (SELECT COUNT(*) FROM order_planning WHERE status = 'Approved') as totalOrders,
          (SELECT COUNT(*) FROM tna_headers WHERE status = 'In Progress') as inProduction,
          (SELECT COUNT(DISTINCT order_no) FROM (
              SELECT order_no FROM pcs_inward WHERE (process LIKE '%Packing%' OR process LIKE '%Dispatch%')
              GROUP BY order_no, process
              HAVING SUM(total_pcs) >= (SELECT IFNULL(SUM(total_qty), 1) FROM (
                  SELECT order_no, process, total_pcs as total_qty FROM pcs_outward
                  UNION ALL SELECT order_no, process, total_qty FROM fabric_to_pcs_outward
                  UNION ALL SELECT order_no, process, total_qty FROM yarn_dyeing_outward
              ) as all_out WHERE all_out.order_no = pcs_inward.order_no AND all_out.process = pcs_inward.process LIMIT 1)
          ) as packed) as readyForDispatch,
          (SELECT COUNT(*) FROM order_planning WHERE factory_date < CURDATE() AND status != 'Completed' AND status != 'Shipped') as delayedOrders
    `,
    'production-summary': `
        SELECT 
          (SELECT IFNULL(SUM(total_pcs), 0) FROM pcs_inward WHERE (process LIKE '%Packing%' OR process LIKE '%Dispatch%')) as totalProduction,
          (SELECT IFNULL(SUM(total_pcs), 0) FROM pcs_inward) as totalInward,
          (SELECT COUNT(*) FROM tna_processes WHERE status != 'Completed' AND due_date < CURDATE()) as productionDelayAlerts
    `,
    'order-pipeline': `
        SELECT 
          op.id as order_id, op.order_no, op.order_name, op.style_type as style_name,
          lc.process_name, lc.sequence_no,
          (
            SELECT IFNULL(SUM(qty), 0) FROM (
              SELECT order_no, process, total_pcs as qty FROM pcs_inward
              UNION ALL SELECT order_no, process, total_qty as qty FROM fabric_to_pcs_inward
              UNION ALL SELECT order_no, process, total_qty as qty FROM yarn_dyeing_inward
              UNION ALL SELECT j.order_no, jp.process_name as process, ji.received_weight as qty 
              FROM job_inward j JOIN job_inward_items ji ON ji.inward_id = j.id JOIN job_inward_item_processes jp ON jp.item_id = ji.id
            ) as all_in 
            WHERE all_in.order_no = op.order_no AND all_in.process = lc.process_name
          ) as inward_qty,
          (
            SELECT IFNULL(SUM(qty), 0) FROM (
              SELECT order_no, process, total_pcs as qty FROM pcs_outward
              UNION ALL SELECT order_no, process, total_qty as qty FROM fabric_to_pcs_outward
              UNION ALL SELECT order_no, process, total_qty as qty FROM yarn_dyeing_outward
              UNION ALL SELECT j.order_no, jp.process_name as process, ji.outward_weight as qty 
              FROM job_outward j JOIN job_outward_items ji ON ji.outward_id = j.id JOIN job_outward_item_processes jp ON jp.outward_item_id = ji.id
            ) as all_out
            WHERE all_out.order_no = op.order_no AND all_out.process = lc.process_name
          ) as target_qty,
          (SELECT tp.status FROM tna_processes tp JOIN tna_headers th ON tp.tna_id = th.id WHERE th.order_no = op.order_no AND tp.process_name = lc.process_name LIMIT 1) as tna_status
        FROM order_planning op
        JOIN order_lifecycle lc ON lc.order_id = op.id
        WHERE op.status = 'Approved' OR op.status = 'In Progress'
        ORDER BY op.id, lc.sequence_no
    `,
    'task-distribution': `
        SELECT 
          (SELECT COUNT(*) FROM tna_processes WHERE status != 'Completed' AND due_date < CURDATE()) as overdueTasks,
          (SELECT COUNT(*) FROM tna_processes WHERE status = 'Completed' AND DATE(completion_date) = CURDATE()) as completedToday,
          assigned_member_name, status, COUNT(*) as count
        FROM tna_processes
        GROUP BY assigned_member_name, status
    `,
    'deadlines': `
        SELECT id, order_no, order_name, factory_date, delivery_date,
        CASE 
          WHEN factory_date < CURDATE() THEN 'Delayed'
          WHEN factory_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Due this week'
          ELSE 'Upcoming'
        END as deadline_status
        FROM order_planning
        WHERE (factory_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) OR factory_date < CURDATE())
        AND status != 'Completed'
        ORDER BY factory_date ASC
    `
};

(async () => {
    for (const [name, sql] of Object.entries(queries)) {
        await test(name, sql);
    }
    process.exit(0);
})();
