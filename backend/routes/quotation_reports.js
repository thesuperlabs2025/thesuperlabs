import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/ledger", (req, res) => {
    const { customer_name, from_date, to_date } = req.query;
    let sql = `
        SELECT 
            q.id,
            q.customer_name,
            ANY_VALUE(c.gst_tin) as gst_tin,
            IFNULL(SUM(it.qty), 0) as total_qty,
            IFNULL(SUM(it.qty * it.rate - it.disc_val - (it.qty * it.rate * it.disc_percent / 100)), 0) as bill_value,
            IFNULL(SUM((it.qty * it.rate - it.disc_val - (it.qty * it.rate * it.disc_percent / 100)) * it.gst_percent / 100), 0) as gst_total,
            q.grand_total,
            q.quotation_date as tx_date,
            q.sales_person
        FROM quotation q
        LEFT JOIN customers c ON q.customer_name = c.name
        LEFT JOIN quotation_items it ON q.id = it.quotation_id
        WHERE 1=1
    `;
    const params = [];
    if (customer_name) { sql += " AND q.customer_name LIKE ?"; params.push(`%${customer_name}%`); }
    if (from_date && to_date) { sql += " AND q.quotation_date BETWEEN ? AND ?"; params.push(from_date, to_date); }
    sql += " GROUP BY q.id ORDER BY q.quotation_date DESC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.get("/summary", (req, res) => {
    const { customer_name, from_date, to_date, sku } = req.query;
    let sql = `
        SELECT 
            q.id as tx_id,
            q.quotation_date as tx_date,
            q.customer_name,
            it.sku,
            it.qty,
            it.rate,
            it.gst_percent,
            it.total as item_total,
            q.grand_total as tx_grand_total
        FROM quotation q
        JOIN quotation_items it ON q.id = it.quotation_id
        WHERE 1=1
    `;
    const params = [];
    if (customer_name) { sql += " AND q.customer_name LIKE ?"; params.push(`%${customer_name}%`); }
    if (sku) { sql += " AND it.sku LIKE ?"; params.push(`%${sku}%`); }
    if (from_date && to_date) { sql += " AND q.quotation_date BETWEEN ? AND ?"; params.push(from_date, to_date); }
    sql += " ORDER BY q.id DESC, it.id ASC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

export default router;
