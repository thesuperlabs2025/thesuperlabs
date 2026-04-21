import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/ledger", (req, res) => {
    const { customer_name, from_date, to_date } = req.query;
    let sql = `
        SELECT 
            d.id,
            d.customer_name,
            ANY_VALUE(c.gst_tin) as gst_tin,
            IFNULL(SUM(it.qty), 0) as total_qty,
            IFNULL(SUM(it.qty * it.rate - it.disc_val - (it.qty * it.rate * it.disc_percent / 100)), 0) as bill_value,
            IFNULL(SUM((it.qty * it.rate - it.disc_val - (it.qty * it.rate * it.disc_percent / 100)) * it.gst_percent / 100), 0) as gst_total,
            d.grand_total,
            d.dc_date as tx_date,
            d.sales_person
        FROM dc d
        LEFT JOIN customers c ON d.customer_name = c.name
        LEFT JOIN dc_items it ON d.id = it.dc_id
        WHERE 1=1
    `;
    const params = [];
    if (customer_name) { sql += " AND d.customer_name LIKE ?"; params.push(`%${customer_name}%`); }
    if (from_date && to_date) { sql += " AND d.dc_date BETWEEN ? AND ?"; params.push(from_date, to_date); }
    sql += " GROUP BY d.id ORDER BY d.dc_date DESC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.get("/summary", (req, res) => {
    const { customer_name, from_date, to_date, sku } = req.query;
    let sql = `
        SELECT 
            d.id as tx_id,
            d.dc_date as tx_date,
            d.customer_name,
            it.sku,
            it.qty,
            it.rate,
            it.gst_percent,
            it.total as item_total,
            d.grand_total as tx_grand_total
        FROM dc d
        JOIN dc_items it ON d.id = it.dc_id
        WHERE 1=1
    `;
    const params = [];
    if (customer_name) { sql += " AND d.customer_name LIKE ?"; params.push(`%${customer_name}%`); }
    if (sku) { sql += " AND it.sku LIKE ?"; params.push(`%${sku}%`); }
    if (from_date && to_date) { sql += " AND d.dc_date BETWEEN ? AND ?"; params.push(from_date, to_date); }
    sql += " ORDER BY d.id DESC, it.id ASC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

export default router;
