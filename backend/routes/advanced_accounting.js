import express from "express";
import db from "../db.js";

const router = express.Router();

/* =================================================================================
   1. DAILY SALES REPORT
   ================================================================================= */
router.get("/daily-sales", async (req, res) => {
    const { startDate, endDate } = req.query;

    // Default to current month if no date provided
    const start = startDate || new Date().toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const sql = `
        SELECT 
            invoice_date,
            COUNT(id) as total_invoices,
            SUM(total_qty) as total_qty,
            SUM(grand_total) as total_sales,
            SUM(CASE WHEN payment_type = 'Cash' THEN grand_total ELSE 0 END) as cash_sales,
            SUM(CASE WHEN payment_type = 'Credit' OR payment_type IS NULL THEN grand_total ELSE 0 END) as credit_sales
        FROM invoices
        WHERE year_id = ? AND invoice_date BETWEEN ? AND ?
        GROUP BY invoice_date
        ORDER BY invoice_date DESC
    `;

    try {
        const yearId = req.headers['x-year-id'];
        const [rows] = await db.promise().query(sql, [yearId, start, end]);
        res.json(rows);
    } catch (err) {
        console.error("Daily Sales Error:", err);
        res.status(500).json({ error: err.message });
    }
});

/* =================================================================================
   2. GENERAL LEDGER (Simplified)
   ================================================================================= */
// This endpoint combines transactions from multiple sources to give a ledger view
router.get("/general-ledger", async (req, res) => {
    const { startDate, endDate } = req.query;
    const start = startDate || '1970-01-01';
    const end = endDate || '2099-12-31';

    try {
        const yearId = req.headers['x-year-id'];
        // Fetch Sales (Credit)
        const salesSql = `SELECT invoice_date as date, CONCAT('Sales Inv #', id) as particulars, 'Sales' as voucher_type, 0 as debit, grand_total as credit FROM invoices WHERE year_id = ? AND invoice_date BETWEEN ? AND ?`;

        // Fetch Purchases (Debit)
        const purchaseSql = `SELECT purchase_date as date, CONCAT('Purchase Inv #', id) as particulars, 'Purchase' as voucher_type, grand_total as debit, 0 as credit FROM purchases WHERE year_id = ? AND purchase_date BETWEEN ? AND ?`;

        // Fetch Receipts (Credit)
        const receiptSql = `SELECT TransactionDate as date, CONCAT('Receipt #', id) as particulars, 'Receipt' as voucher_type, 0 as debit, TransactionAmount as credit FROM receipts WHERE year_id = ? AND TransactionDate BETWEEN ? AND ?`;

        // Fetch Payments/Vouchers (Debit)
        const paymentSql = `SELECT VoucherDate as date, CONCAT('Payment #', id) as particulars, 'Payment' as voucher_type, Amount as debit, 0 as credit FROM vouchers WHERE year_id = ? AND VoucherDate BETWEEN ? AND ?`;

        const [sales] = await db.promise().query(salesSql, [yearId, start, end]);
        const [purchases] = await db.promise().query(purchaseSql, [yearId, start, end]);
        const [receipts] = await db.promise().query(receiptSql, [yearId, start, end]);
        const [payments] = await db.promise().query(paymentSql, [yearId, start, end]);

        // Merge and sort
        let ledger = [...sales, ...purchases, ...receipts, ...payments];
        ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json(ledger);

    } catch (err) {
        console.error("General Ledger Error:", err);
        res.status(500).json({ error: err.message });
    }
});

/* =================================================================================
   3. TRIAL BALANCE
   ================================================================================= */
router.get("/trial-balance", async (req, res) => {
    const { asOfDate } = req.query;
    const dateLimit = asOfDate || new Date().toISOString().split('T')[0];

    try {
        const yearId = req.headers['x-year-id'];
        // 1. Sales Accounts (Credit Balance)
        const [sales] = await db.promise().query(`SELECT 'Sales Account' as account_name, 'Revenue' as group_name, 0 as debit, IFNULL(SUM(grand_total),0) as credit FROM invoices WHERE year_id = ? AND invoice_date <= ?`, [yearId, dateLimit]);

        // 2. Purchase Accounts (Debit Balance)
        const [purchases] = await db.promise().query(`SELECT 'Purchase Account' as account_name, 'Expense' as group_name, IFNULL(SUM(grand_total),0) as debit, 0 as credit FROM purchases WHERE year_id = ? AND purchase_date <= ?`, [yearId, dateLimit]);

        // 3. Sundry Debtors (Debit Balance) - Simplified: Total Sales - Total Receipts
        const [totalSales] = await db.promise().query(`SELECT IFNULL(SUM(grand_total),0) as val FROM invoices WHERE year_id = ? AND invoice_date <= ?`, [yearId, dateLimit]);
        const [totalReceipts] = await db.promise().query(`SELECT IFNULL(SUM(TransactionAmount),0) as val FROM receipts WHERE year_id = ? AND TransactionDate <= ?`, [yearId, dateLimit]);
        const debtorsBalance = totalSales[0].val - totalReceipts[0].val;

        // 4. Sundry Creditors (Credit Balance) - Simplified: Total Purchases - Total Payments
        const [totalPurchases] = await db.promise().query(`SELECT IFNULL(SUM(grand_total),0) as val FROM purchases WHERE year_id = ? AND purchase_date <= ?`, [yearId, dateLimit]);
        const [totalPayments] = await db.promise().query(`SELECT IFNULL(SUM(Amount),0) as val FROM vouchers WHERE year_id = ? AND VoucherDate <= ?`, [yearId, dateLimit]);
        const creditorsBalance = totalPurchases[0].val - totalPayments[0].val;

        // 5. Cash/Bank (Debit Balance) - Simplified
        const cashBalance = totalReceipts[0].val - totalPayments[0].val;

        const trialBalance = [
            { account_name: 'Sales Account', group_name: 'Revenue', debit: 0, credit: sales[0].credit },
            { account_name: 'Purchase Account', group_name: 'Expenses', debit: purchases[0].debit, credit: 0 },
            { account_name: 'Sundry Debtors', group_name: 'Current Assets', debit: debtorsBalance > 0 ? debtorsBalance : 0, credit: debtorsBalance < 0 ? Math.abs(debtorsBalance) : 0 },
            { account_name: 'Sundry Creditors', group_name: 'Current Liabilities', debit: creditorsBalance < 0 ? Math.abs(creditorsBalance) : 0, credit: creditorsBalance > 0 ? creditorsBalance : 0 },
            { account_name: 'Cash/Bank', group_name: 'Current Assets', debit: cashBalance > 0 ? cashBalance : 0, credit: cashBalance < 0 ? Math.abs(cashBalance) : 0 }
        ];

        res.json(trialBalance);

    } catch (err) {
        console.error("Trial Balance Error:", err);
        res.status(500).json({ error: err.message });
    }
});

/* =================================================================================
   4. BALANCE SHEET
   ================================================================================= */
router.get("/balance-sheet", async (req, res) => {
    const { asOfDate } = req.query;
    const dateLimit = asOfDate || new Date().toISOString().split('T')[0];

    try {
        const yearId = req.headers['x-year-id'];
        // Calculate Net Profit (Revenue - Expenses)
        const [sales] = await db.promise().query(`SELECT IFNULL(SUM(grand_total),0) as val FROM invoices WHERE year_id = ? AND invoice_date <= ?`, [yearId, dateLimit]);
        const [purchases] = await db.promise().query(`SELECT IFNULL(SUM(grand_total),0) as val FROM purchases WHERE year_id = ? AND purchase_date <= ?`, [yearId, dateLimit]);

        // This is a simplified Net Profit. Real world needs Expenses table, Direct vs Indirect etc.
        const netProfit = sales[0].val - purchases[0].val;

        // Current Assets
        // Debtors
        const [totalReceipts] = await db.promise().query(`SELECT IFNULL(SUM(TransactionAmount),0) as val FROM receipts WHERE year_id = ? AND TransactionDate <= ?`, [yearId, dateLimit]);
        const debtors = sales[0].val - totalReceipts[0].val;

        // Cash
        const [totalPayments] = await db.promise().query(`SELECT IFNULL(SUM(Amount),0) as val FROM vouchers WHERE year_id = ? AND VoucherDate <= ?`, [yearId, dateLimit]);
        const cash = totalReceipts[0].val - totalPayments[0].val;

        // Current Liabilities
        // Creditors
        const creditors = purchases[0].val - totalPayments[0].val;

        const balanceSheet = {
            liabilities: [
                { head: 'Capital Account', amount: 0 }, // Placeholder
                { head: 'Loans', amount: 0 }, // Placeholder
                { head: 'Sundry Creditors', amount: creditors > 0 ? creditors : 0 },
                { head: 'Profit & Loss A/c', amount: netProfit }
            ],
            assets: [
                { head: 'Fixed Assets', amount: 0 }, // Placeholder
                { head: 'Sundry Debtors', amount: debtors > 0 ? debtors : 0 },
                { head: 'Cash / Bank', amount: cash },
                { head: 'Closing Stock', amount: 0 } // Needs stock valuation logic
            ]
        };

        res.json(balanceSheet);

    } catch (err) {
        console.error("Balance Sheet Error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
