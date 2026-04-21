
import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { bankName, fromDate, toDate } = req.query;

        if (!bankName) {
            return res.status(400).json({ error: "Bank Name is required" });
        }

        // 1. No Opening Balance as requested
        let openingBalance = 0;

        // 2. Fetch Transactions (Between dates)
        let transactions = [];

        // Receipts
        const receiptQuery = `
      SELECT 
        id, 
        DATE_FORMAT(TransactionDate, '%Y-%m-%d') as date, 
        ReceiptRefNo as refNo, 
        CONCAT('Receipt from ', customer_name) as description, 
        TransactionAmount as credit, 
        0 as debit,
        'Receipt' as type
      FROM receipts 
      WHERE BankAccountName = ? 
      ${fromDate ? "AND TransactionDate >= ?" : ""}
      ${toDate ? "AND TransactionDate <= ?" : ""}
    `;

        const receiptParams = [bankName];
        if (fromDate) receiptParams.push(fromDate);
        if (toDate) receiptParams.push(toDate);

        const [receipts] = await db.promise().query(receiptQuery, receiptParams);

        // Vouchers
        const voucherQuery = `
      SELECT 
        id, 
        DATE_FORMAT(VoucherDate, '%Y-%m-%d') as date, 
        VoucherRefNo as refNo, 
        CONCAT('Payment to ', SupplierName) as description, 
        0 as credit, 
        Amount as debit,
        'Voucher' as type
      FROM vouchers 
      WHERE BankAccountName = ? 
      ${fromDate ? "AND VoucherDate >= ?" : ""}
      ${toDate ? "AND VoucherDate <= ?" : ""}
    `;

        const voucherParams = [bankName];
        if (fromDate) voucherParams.push(fromDate);
        if (toDate) voucherParams.push(toDate);

        const [vouchers] = await db.promise().query(voucherQuery, voucherParams);

        // Merge and Sort
        transactions = [...receipts, ...vouchers].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Calculate Running Balance
        let currentBalance = openingBalance;
        const ledger = transactions.map(t => {
            currentBalance += (Number(t.credit) - Number(t.debit));
            return {
                ...t,
                balance: currentBalance
            };
        });

        res.json({
            bankName,
            openingBalance,
            transactions: ledger,
            closingBalance: currentBalance
        });

    } catch (err) {
        console.error("Bank Ledger Error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
