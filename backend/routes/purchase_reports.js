import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/ledger", (req, res) => {
    const { supplier_name, from_date, to_date } = req.query;
    let sql = `
        SELECT 
            p.id,
            p.supplier_name as party_name,
            ANY_VALUE(s.gst_tin) as gst_tin,
            IFNULL(SUM(it.qty), 0) as total_qty,
            IFNULL(SUM(it.qty * it.rate - it.disc_val - (it.qty * it.rate * it.disc_percent / 100)), 0) as bill_value,
            IFNULL(SUM((it.qty * it.rate - it.disc_val - (it.qty * it.rate * it.disc_percent / 100)) * it.gst_percent / 100), 0) as gst_total,
            p.grand_total,
            p.purchase_date as tx_date,
            p.purchase_person as person_name
        FROM purchases p
        LEFT JOIN supplier s ON p.supplier_name = s.name
        LEFT JOIN purchase_items it ON p.id = it.purchase_id
        WHERE 1=1
    `;
    const params = [];
    if (supplier_name) { sql += " AND p.supplier_name LIKE ?"; params.push(`%${supplier_name}%`); }
    if (from_date && to_date) { sql += " AND p.purchase_date BETWEEN ? AND ?"; params.push(from_date, to_date); }
    sql += " GROUP BY p.id ORDER BY p.purchase_date DESC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.get("/summary", (req, res) => {
    const { supplier_name, from_date, to_date, sku } = req.query;
    let sql = `
        SELECT 
            p.id as tx_id,
            p.purchase_date as tx_date,
            p.supplier_name as party_name,
            it.sku,
            it.qty,
            it.rate,
            it.gst_percent,
            it.total as item_total,
            p.grand_total as tx_grand_total
        FROM purchases p
        JOIN purchase_items it ON p.id = it.purchase_id
        WHERE 1=1
    `;
    const params = [];
    if (supplier_name) { sql += " AND p.supplier_name LIKE ?"; params.push(`%${supplier_name}%`); }
    if (sku) { sql += " AND it.sku LIKE ?"; params.push(`%${sku}%`); }
    if (from_date && to_date) { sql += " AND p.purchase_date BETWEEN ? AND ?"; params.push(from_date, to_date); }
    sql += " ORDER BY p.id DESC, it.id ASC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

export default router;
