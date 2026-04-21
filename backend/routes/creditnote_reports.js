import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/ledger", (req, res) => {
    const { customer_name, from_date, to_date } = req.query;
    let sql = `
        SELECT 
            c2.id,
            c2.customer_name,
            ANY_VALUE(c.gst_tin) as gst_tin,
            IFNULL(SUM(it.qty), 0) as total_qty,
            IFNULL(SUM(it.qty * it.rate - it.disc_val - (it.qty * it.rate * it.disc_percent / 100)), 0) as bill_value,
            IFNULL(SUM((it.qty * it.rate - it.disc_val - (it.qty * it.rate * it.disc_percent / 100)) * it.gst_percent / 100), 0) as gst_total,
            c2.grand_total,
            c2.credit_note_date as tx_date,
            c2.sales_person
        FROM credit_note c2
        LEFT JOIN customers c ON c2.customer_name = c.name
        LEFT JOIN credit_note_items it ON c2.id = it.credit_note_id
        WHERE 1=1
    `;
    const params = [];
    if (customer_name) { sql += " AND c2.customer_name LIKE ?"; params.push(`%${customer_name}%`); }
    if (from_date && to_date) { sql += " AND c2.credit_note_date BETWEEN ? AND ?"; params.push(from_date, to_date); }
    sql += " GROUP BY c2.id ORDER BY c2.credit_note_date DESC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.get("/summary", (req, res) => {
    const { customer_name, from_date, to_date, sku } = req.query;
    let sql = `
        SELECT 
            c2.id as tx_id,
            c2.credit_note_date as tx_date,
            c2.customer_name,
            it.sku,
            it.qty,
            it.rate,
            it.gst_percent,
            it.total as item_total,
            c2.grand_total as tx_grand_total
        FROM credit_note c2
        JOIN credit_note_items it ON c2.id = it.credit_note_id
        WHERE 1=1
    `;
    const params = [];
    if (customer_name) { sql += " AND c2.customer_name LIKE ?"; params.push(`%${customer_name}%`); }
    if (sku) { sql += " AND it.sku LIKE ?"; params.push(`%${sku}%`); }
    if (from_date && to_date) { sql += " AND c2.credit_note_date BETWEEN ? AND ?"; params.push(from_date, to_date); }
    sql += " ORDER BY c2.id DESC, it.id ASC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

export default router;
