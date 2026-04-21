import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/invoice-ledger", (req, res) => {
    const {
        customer_name,
        sales_person,
        agent_name,
        status,
        from_date,
        to_date,
        manual_invoice_no,
        dc_no
    } = req.query;

    let sql = `
    SELECT 
      i.id,
      i.customer_name,
      c.gst_tin,
      i.net_total as bill_value,
      i.gst_total as gst_total,
      i.grand_total,
      i.invoice_date,
      i.total_qty,
      i.status,
      i.manual_invoice_no,
      i.sales_person,
      i.agent_name
    FROM invoices i
    LEFT JOIN customers c ON i.customer_name = c.name
    WHERE 1=1
  `;
    const params = [];

    if (customer_name) {
        sql += " AND customer_name LIKE ?";
        params.push(`%${customer_name}%`);
    }
    if (sales_person) {
        sql += " AND sales_person = ?";
        params.push(sales_person);
    }
    if (agent_name) {
        sql += " AND agent_name = ?";
        params.push(agent_name);
    }
    if (status) {
        sql += " AND status = ?";
        params.push(status);
    }
    if (manual_invoice_no) {
        sql += " AND (manual_invoice_no LIKE ? OR id LIKE ?)";
        params.push(`%${manual_invoice_no}%`, `%${manual_invoice_no}%`);
    }
    if (dc_no) {
        sql += " AND dc_no LIKE ?";
        params.push(`%${dc_no}%`);
    }
    if (from_date && to_date) {
        sql += " AND i.invoice_date BETWEEN ? AND ?";
        params.push(from_date, to_date);
    }

    sql += " ORDER BY i.invoice_date DESC";

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Ledger Fetch Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

router.get("/invoice-summary", (req, res) => {
    const {
        customer_name,
        from_date,
        to_date,
        sku,
        manual_invoice_no
    } = req.query;

    let sql = `
    SELECT 
      i.id as invoice_id,
      i.manual_invoice_no,
      i.invoice_date,
      i.customer_name,
      it.sku,
      it.qty,
      it.rate,
      it.gst_percent,
      it.total as item_total,
      i.grand_total as invoice_grand_total
    FROM invoices i
    JOIN invoice_items it ON i.id = it.invoice_id
    WHERE 1=1
  `;
    const params = [];

    if (customer_name) {
        sql += " AND i.customer_name LIKE ?";
        params.push(`%${customer_name}%`);
    }
    if (sku) {
        sql += " AND it.sku LIKE ?";
        params.push(`%${sku}%`);
    }
    if (manual_invoice_no) {
        sql += " AND (i.manual_invoice_no LIKE ? OR i.id LIKE ?)";
        params.push(`%${manual_invoice_no}%`, `%${manual_invoice_no}%`);
    }
    if (from_date && to_date) {
        sql += " AND i.invoice_date BETWEEN ? AND ?";
        params.push(from_date, to_date);
    }

    sql += " ORDER BY i.id DESC, it.id ASC";

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Summary Fetch Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

export default router;
