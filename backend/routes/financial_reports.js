import express from "express";
import db from "../db.js";

const router = express.Router();

// 1. Cash Book Report
router.get("/cash-book", async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        // Fetch Cash Receipts (Inflow)
        const receiptSql = `
            SELECT 
                TransactionDate as date, 
                CONCAT('Receipt #', id, ' - ', customer_name) as description,
                'Receipt' as type,
                TransactionAmount as credit,
                0 as debit
            FROM receipts 
            WHERE ModeOfPayment = 'Cash' 
            ${startDate ? 'AND TransactionDate >= ?' : ''}
            ${endDate ? 'AND TransactionDate <= ?' : ''}
        `;

        // Fetch Cash Vouchers (Outflow)
        const voucherSql = `
            SELECT 
                VoucherDate as date, 
                CONCAT('Voucher #', id, ' - ', SupplierName) as description,
                'Payment' as type,
                0 as credit,
                Amount as debit
            FROM vouchers 
            WHERE ModeOfPayment = 'Cash'
            ${startDate ? 'AND VoucherDate >= ?' : ''} 
            ${endDate ? 'AND VoucherDate <= ?' : ''}
        `;

        const params = [];
        if (startDate) params.push(startDate);
        if (endDate) params.push(endDate);

        // Execute both queries
        const [receipts] = await db.promise().query(receiptSql, params);
        const [vouchers] = await db.promise().query(voucherSql, params);

        // Combine and Sort
        let allTransactions = [...receipts, ...vouchers].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Calculate Running Balance
        let balance = 0;
        const result = allTransactions.map(t => {
            balance += Number(t.credit) - Number(t.debit);
            return { ...t, balance };
        });

        res.json(result);

    } catch (err) {
        console.error("Cash Book Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. TDS Report
router.get("/tds", async (req, res) => {
    const { startDate, endDate } = req.query;

    let sql = `
        SELECT 
            id as invoice_no,
            invoice_date,
            customer_name,
            gst_total,
            grand_total,
            tds_percent,
            tds as tax_amount,
            (grand_total + tds) as gross_amount 
        FROM invoices 
        WHERE tds > 0
    `;

    const params = [];
    if (startDate) {
        sql += " AND invoice_date >= ?";
        params.push(startDate);
    }
    if (endDate) {
        sql += " AND invoice_date <= ?";
        params.push(endDate);
    }

    sql += " ORDER BY invoice_date DESC";

    try {
        const [rows] = await db.promise().query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("TDS Report Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 3. TCS Report
router.get("/tcs", async (req, res) => {
    const { startDate, endDate } = req.query;

    let sql = `
        SELECT 
            id as invoice_no,
            invoice_date,
            customer_name,
            gst_total,
            grand_total,
            tcs_percent,
            tcs as tax_amount,
            (grand_total - tcs) as gross_amount
        FROM invoices 
        WHERE tcs > 0
    `;

    const params = [];
    if (startDate) {
        sql += " AND invoice_date >= ?";
        params.push(startDate);
    }
    if (endDate) {
        sql += " AND invoice_date <= ?";
        params.push(endDate);
    }

    sql += " ORDER BY invoice_date DESC";

    try {
        const [rows] = await db.promise().query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("TCS Report Error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
