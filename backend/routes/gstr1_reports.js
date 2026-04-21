import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/detailed", async (req, res) => {
    const { startDate, endDate, gstRate, hsn, type } = req.query;

    // Base SQL query
    let sql = `
        SELECT 
            i.customer_name as company_name,
            c.gst_tin as gstin,
            i.id as invoice_no,
            i.invoice_date,
            i.is_inclusive,
            CASE 
                WHEN i.is_inclusive = 1 THEN (it.total / (1 + it.gst_percent/100))
                ELSE it.total 
            END as taxable_value,
            p.hsn_code as hsn,
            it.gst_percent as gst_rate,
            -- IGST Logic: If place_of_delivery is NOT NULL and NOT empty and NOT Tamil Nadu
            CASE 
                WHEN (i.place_of_delivery IS NOT NULL AND TRIM(i.place_of_delivery) != '' AND UPPER(REPLACE(i.place_of_delivery, ' ', '')) != 'TAMILNADU') THEN 
                    it.gst_percent
                ELSE 0 
            END as igst_rate,
            CASE 
                WHEN (i.place_of_delivery IS NOT NULL AND TRIM(i.place_of_delivery) != '' AND UPPER(REPLACE(i.place_of_delivery, ' ', '')) != 'TAMILNADU') THEN 
                    CASE WHEN i.is_inclusive = 1 THEN (it.total - (it.total / (1 + it.gst_percent/100))) ELSE (it.total * (it.gst_percent/100)) END
                ELSE 0 
            END as igst,
            -- CGST Logic: If place_of_delivery IS NULL or EMPTY or Tamil Nadu
            CASE 
                WHEN (i.place_of_delivery IS NULL OR TRIM(i.place_of_delivery) = '' OR UPPER(REPLACE(i.place_of_delivery, ' ', '')) = 'TAMILNADU') THEN 
                    (it.gst_percent / 2)
                ELSE 0 
            END as cgst_rate,
            CASE 
                WHEN (i.place_of_delivery IS NULL OR TRIM(i.place_of_delivery) = '' OR UPPER(REPLACE(i.place_of_delivery, ' ', '')) = 'TAMILNADU') THEN 
                    CASE WHEN i.is_inclusive = 1 THEN ((it.total - (it.total / (1 + it.gst_percent/100))) / 2) ELSE ((it.total * (it.gst_percent/100)) / 2) END
                ELSE 0 
            END as cgst,
            -- SGST Logic: Same as CGST
            CASE 
                WHEN (i.place_of_delivery IS NULL OR TRIM(i.place_of_delivery) = '' OR UPPER(REPLACE(i.place_of_delivery, ' ', '')) = 'TAMILNADU') THEN 
                    (it.gst_percent / 2)
                ELSE 0 
            END as sgst_rate,
            CASE 
                WHEN (i.place_of_delivery IS NULL OR TRIM(i.place_of_delivery) = '' OR UPPER(REPLACE(i.place_of_delivery, ' ', '')) = 'TAMILNADU') THEN 
                    CASE WHEN i.is_inclusive = 1 THEN ((it.total - (it.total / (1 + it.gst_percent/100))) / 2) ELSE ((it.total * (it.gst_percent/100)) / 2) END
                ELSE 0 
            END as sgst,
            
            CASE 
                WHEN i.is_inclusive = 1 THEN (it.total - (it.total / (1 + it.gst_percent/100)))
                ELSE (it.total * (it.gst_percent/100))
            END as tax_amount,
            
            CASE 
                WHEN i.is_inclusive = 1 THEN it.total
                ELSE (it.total + (it.total * (it.gst_percent/100)))
            END as total_value
        FROM invoice_items it
        JOIN invoices i ON it.invoice_id = i.id
        LEFT JOIN customers c ON i.customer_name = c.name
        LEFT JOIN products p ON it.sku = p.sku
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
    if (gstRate) {
        sql += " AND it.gst_percent = ?";
        params.push(gstRate);
    }
    if (hsn) {
        sql += " AND p.hsn_code LIKE ?";
        params.push(`%${hsn}%`);
    }
    if (type === "B2B") {
        sql += " AND (c.gst_tin IS NOT NULL AND c.gst_tin != '')";
    } else if (type === "B2C") {
        sql += " AND (c.gst_tin IS NULL OR c.gst_tin = '')";
    }

    sql += " ORDER BY i.invoice_date DESC, i.id DESC";

    try {
        const [rows] = await db.promise().query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("GSTR-1 Error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
