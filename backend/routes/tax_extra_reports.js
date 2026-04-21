import express from "express";
import db from "../db.js";

const router = express.Router();

// 1. RCM (Reverse Charge Mechanism) Report
// Logic: Purchases from unregistered dealers (URD)
router.get("/rcm", async (req, res) => {
    const { startDate, endDate } = req.query;
    let sql = `
        SELECT 
            p.*,
            s.gst_tin as supplier_gstin
        FROM purchases p
        LEFT JOIN supplier s ON p.supplier_name = s.name
        WHERE (s.gst_tin IS NULL OR s.gst_tin = '')
    `;
    const params = [];
    if (startDate) {
        sql += " AND p.purchase_date >= ?";
        params.push(startDate);
    }
    if (endDate) {
        sql += " AND p.purchase_date <= ?";
        params.push(endDate);
    }

    sql += " ORDER BY p.purchase_date DESC";

    try {
        const [rows] = await db.promise().query(sql, params);

        const mappedRows = rows.map(r => {
            // Safe access to gst_total or fallback
            // Try gst_total, total_gst, tax_amount, or calculate from net if possible
            let gstTotal = 0;
            if (r.gst_total !== undefined) gstTotal = Number(r.gst_total);
            else if (r.total_gst !== undefined) gstTotal = Number(r.total_gst);
            else if (r.tax_amount !== undefined) gstTotal = Number(r.tax_amount);

            // If gst_total is 0 but we have net_total and grand_total, we can try to infer
            if (!gstTotal && r.grand_total && r.net_total) {
                gstTotal = Number(r.grand_total) - Number(r.net_total);
            }

            const taxableValue = r.net_total ? Number(r.net_total) : (Number(r.grand_total || 0) - gstTotal);

            return {
                purchase_id: r.id,
                purchase_date: r.purchase_date,
                supplier_name: r.supplier_name,
                supplier_gstin: r.supplier_gstin,
                grand_total: r.grand_total,
                gst_total: gstTotal,
                taxable_value: taxableValue,
                reverse_charge: 'Yes'
            };
        });

        res.json(mappedRows);
    } catch (err) {
        console.error("RCM Report Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Amended Invoice Report
// Logic: Invoices that have been modified (Tracked via updated_at or similar)
// For now, pulling all invoices that could be considered for amendment
router.get("/amended", async (req, res) => {
    const { startDate, endDate } = req.query;
    let sql = `
    SELECT
    i.id as invoice_no,
        i.invoice_date,
        i.customer_name,
        c.gst_tin as gstin,
        i.grand_total as original_value,
        i.grand_total as amended_value,
        'Revised' as amendment_type
        FROM invoices i
        LEFT JOIN customers c ON i.customer_name = c.name
        WHERE 1 = 1
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
    sql += " ORDER BY i.invoice_date DESC";

    try {
        const [rows] = await db.promise().query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Amended Report Error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
