import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/ledger", (req, res) => {
    const { customer_name, from_date, to_date } = req.query;
    let sql = `
        SELECT 
            s.id,
            s.customer_name,
            ANY_VALUE(c.gst_tin) as gst_tin,
            IFNULL(SUM(it.qty), 0) as total_qty,
            IFNULL(SUM(it.qty * it.rate - it.disc_val - (it.qty * it.rate * it.disc_percent / 100)), 0) as bill_value,
            IFNULL(SUM((it.qty * it.rate - it.disc_val - (it.qty * it.rate * it.disc_percent / 100)) * it.gst_percent / 100), 0) as gst_total,
            s.grand_total,
            s.sales_return_date as tx_date,
            s.sales_person
        FROM sales_return s
        LEFT JOIN customers c ON s.customer_name = c.name
        LEFT JOIN sales_return_items it ON s.id = it.sales_return_id
        WHERE 1=1
    `;
    const params = [];
    if (customer_name) { sql += " AND s.customer_name LIKE ?"; params.push(`%${customer_name}%`); }
    if (from_date && to_date) { sql += " AND s.sales_return_date BETWEEN ? AND ?"; params.push(from_date, to_date); }
    sql += " GROUP BY s.id ORDER BY s.sales_return_date DESC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.get("/summary", (req, res) => {
    const { customer_name, from_date, to_date, sku } = req.query;
    let sql = `
        SELECT 
            s.id as tx_id,
            s.sales_return_date as tx_date,
            s.customer_name,
            it.sku,
            it.qty,
            it.rate,
            it.gst_percent,
            it.total as item_total,
            s.grand_total as tx_grand_total
        FROM sales_return s
        JOIN sales_return_items it ON s.id = it.sales_return_id
        WHERE 1=1
    `;
    const params = [];
    if (customer_name) { sql += " AND s.customer_name LIKE ?"; params.push(`%${customer_name}%`); }
    if (sku) { sql += " AND it.sku LIKE ?"; params.push(`%${sku}%`); }
    if (from_date && to_date) { sql += " AND s.sales_return_date BETWEEN ? AND ?"; params.push(from_date, to_date); }
    sql += " ORDER BY s.id DESC, it.id ASC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

export default router;
