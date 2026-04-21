import express from "express";
import db from "../db.js";

const router = express.Router();

// Helper to get ageing buckets
const getAgeingBuckets = (dateCol) => {
    return `
        SUM(CASE WHEN DATEDIFF(CURRENT_DATE, ${dateCol}) <= 30 THEN balance ELSE 0 END) as bucket_0_30,
        SUM(CASE WHEN DATEDIFF(CURRENT_DATE, ${dateCol}) BETWEEN 31 AND 60 THEN balance ELSE 0 END) as bucket_31_60,
        SUM(CASE WHEN DATEDIFF(CURRENT_DATE, ${dateCol}) BETWEEN 61 AND 90 THEN balance ELSE 0 END) as bucket_61_90,
        SUM(CASE WHEN DATEDIFF(CURRENT_DATE, ${dateCol}) > 90 THEN balance ELSE 0 END) as bucket_90_plus
    `;
};

// 1. Customer Ageing Report
router.get("/customer", async (req, res) => {
    const sql = `
        SELECT 
            customer_name,
            SUM(total_amount) as total_receivable,
            SUM(paid_amount) as total_received,
            SUM(total_amount - paid_amount) as balance,
            SUM(CASE WHEN days_diff <= 30 THEN (total_amount - paid_amount) ELSE 0 END) as bucket_0_30,
            SUM(CASE WHEN days_diff BETWEEN 31 AND 60 THEN (total_amount - paid_amount) ELSE 0 END) as bucket_31_60,
            SUM(CASE WHEN days_diff BETWEEN 61 AND 90 THEN (total_amount - paid_amount) ELSE 0 END) as bucket_61_90,
            SUM(CASE WHEN days_diff > 90 THEN (total_amount - paid_amount) ELSE 0 END) as bucket_90_plus
        FROM (
            SELECT 
                i.customer_name,
                i.grand_total as total_amount,
                IFNULL((SELECT SUM(TransactionAmount) FROM receipts WHERE ReferenceNo = i.id AND PaymentAgainst = 'Invoice'), 0) as paid_amount,
                DATEDIFF(CURRENT_DATE, i.invoice_date) as days_diff
            FROM invoices i
        ) as t
        GROUP BY customer_name
        HAVING balance > 0
        ORDER BY balance DESC
    `;
    try {
        const [rows] = await db.promise().query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Supplier Ageing Report
router.get("/supplier", async (req, res) => {
    const sql = `
        SELECT 
            supplier_name,
            SUM(total_amount) as total_payable,
            SUM(paid_amount) as total_paid,
            SUM(total_amount - paid_amount) as balance,
            SUM(CASE WHEN days_diff <= 30 THEN (total_amount - paid_amount) ELSE 0 END) as bucket_0_30,
            SUM(CASE WHEN days_diff BETWEEN 31 AND 60 THEN (total_amount - paid_amount) ELSE 0 END) as bucket_31_60,
            SUM(CASE WHEN days_diff BETWEEN 61 AND 90 THEN (total_amount - paid_amount) ELSE 0 END) as bucket_61_90,
            SUM(CASE WHEN days_diff > 90 THEN (total_amount - paid_amount) ELSE 0 END) as bucket_90_plus
        FROM (
            SELECT 
                p.supplier_name,
                p.grand_total as total_amount,
                IFNULL((SELECT SUM(Amount) FROM vouchers WHERE ReferenceNo = p.id), 0) as paid_amount,
                DATEDIFF(CURRENT_DATE, p.purchase_date) as days_diff
            FROM purchases p
        ) as t
        GROUP BY supplier_name
        HAVING balance > 0
        ORDER BY balance DESC
    `;
    try {
        const [rows] = await db.promise().query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Invoice Ageing Report
router.get("/invoice", async (req, res) => {
    const sql = `
        SELECT 
            i.id as invoice_no,
            i.invoice_date,
            i.customer_name,
            i.grand_total as total_amount,
            IFNULL((SELECT SUM(TransactionAmount) FROM receipts WHERE ReferenceNo = i.id AND PaymentAgainst = 'Invoice'), 0) as paid_amount,
            (i.grand_total - IFNULL((SELECT SUM(TransactionAmount) FROM receipts WHERE ReferenceNo = i.id AND PaymentAgainst = 'Invoice'), 0)) as balance,
            DATEDIFF(CURRENT_DATE, i.invoice_date) as days_old,
            CASE 
                WHEN DATEDIFF(CURRENT_DATE, i.invoice_date) <= 30 THEN '0-30 Days'
                WHEN DATEDIFF(CURRENT_DATE, i.invoice_date) <= 60 THEN '31-60 Days'
                WHEN DATEDIFF(CURRENT_DATE, i.invoice_date) <= 90 THEN '61-90 Days'
                ELSE '90+ Days'
            END as ageing_bucket
        FROM invoices i
        WHERE (i.grand_total - IFNULL((SELECT SUM(TransactionAmount) FROM receipts WHERE ReferenceNo = i.id AND PaymentAgainst = 'Invoice'), 0)) > 0
        ORDER BY i.invoice_date ASC
    `;
    try {
        const [rows] = await db.promise().query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
