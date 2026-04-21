import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/ledger", (req, res) => {
    const { customer_name, from_date, to_date } = req.query;
    let sql = `
        SELECT 
            p.id,
            p.customer_name,
            ANY_VALUE(s.gst_tin) as gst_tin,
            IFNULL(SUM(it.qty), 0) as total_qty,
            IFNULL(SUM(it.qty * it.rate - it.disc_val - (it.qty * it.rate * it.disc_percent / 100)), 0) as bill_value,
            IFNULL(SUM((it.qty * it.rate - it.disc_val - (it.qty * it.rate * it.disc_percent / 100)) * it.gst_percent / 100), 0) as gst_total,
            p.grand_total,
            p.purchase_return_date as tx_date,
            p.sales_person
        FROM purchase_return p
        LEFT JOIN supplier s ON p.customer_name = s.name
        LEFT JOIN purchase_return_items it ON p.id = it.purchase_return_id
        WHERE 1=1
    `;
    const params = [];
    if (customer_name) { sql += " AND p.customer_name LIKE ?"; params.push(`%${customer_name}%`); }
    if (from_date && to_date) { sql += " AND p.purchase_return_date BETWEEN ? AND ?"; params.push(from_date, to_date); }
    sql += " GROUP BY p.id ORDER BY p.purchase_return_date DESC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.get("/summary", (req, res) => {
    const { customer_name, from_date, to_date, sku } = req.query;
    let sql = `
        SELECT 
            p.id as tx_id,
            p.purchase_return_date as tx_date,
            p.customer_name,
            it.sku,
            it.qty,
            it.rate,
            it.gst_percent,
            it.total as item_total,
            p.grand_total as tx_grand_total
        FROM purchase_return p
        JOIN purchase_return_items it ON p.id = it.purchase_return_id
        WHERE 1=1
    `;
    const params = [];
    if (customer_name) { sql += " AND p.customer_name LIKE ?"; params.push(`%${customer_name}%`); }
    if (sku) { sql += " AND it.sku LIKE ?"; params.push(`%${sku}%`); }
    if (from_date && to_date) { sql += " AND p.purchase_return_date BETWEEN ? AND ?"; params.push(from_date, to_date); }
    sql += " ORDER BY p.id DESC, it.id ASC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

export default router;
