import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const { startDate, endDate } = req.query;
    let sql = `
        SELECT 
            i.id AS invoice_id,
            i.invoice_date,
            ANY_VALUE(i.customer_name) AS customer_name,
            p.hsn_code,
            it.gst_percent,
            SUM(it.qty) as total_qty,
            SUM(it.total / (1 + it.gst_percent/100)) as net_amount,
            SUM(it.total - (it.total / (1 + it.gst_percent/100))) as tax_amount,
            SUM(it.total) as total_amount
        FROM invoice_items it
        LEFT JOIN products p ON it.sku = p.sku
        LEFT JOIN invoices i ON it.invoice_id = i.id
        WHERE 1=1
    `;
    const params = [];

    if (startDate) {
        sql += " AND i.invoice_date >= ?";
        params.push(startDate);
    }
    if (endDate) {
        sql += " AND i.invoice_date <= ?";
        params.push(endDate);
    }

    sql += " GROUP BY i.id, p.hsn_code, it.gst_percent ORDER BY i.invoice_date DESC, i.id DESC";

    try {
        const [rows] = await db.promise().query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

export default router;
