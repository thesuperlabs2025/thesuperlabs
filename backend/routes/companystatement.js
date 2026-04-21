import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const { name, startDate, endDate } = req.query;
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }

    const params = [];
    let dateFilter = "";
    if (startDate && endDate) {
        dateFilter = " AND date_col BETWEEN ? AND ?";
        params.push(startDate, endDate);
    }

    // We will build a complex UNION ALL query
    // Type 1: Invoices (Debit)
    // Type 2: Sales Return (Credit)
    // Type 3: Receipts (Credit)
    // Type 4: Purchases (Credit)
    // Type 5: Purchase Return (Debit)
    // Type 6: Vouchers (Debit - Payment to Supplier)
    // Type 7: Credit Note (Credit)
    // Type 8: Debit Note (Debit)

    const sql = `
        SELECT * FROM (
            SELECT id, invoice_date AS date_col, CONCAT('Sales Invoice #', id) AS details, grand_total AS debit, 0 AS credit, customer_name AS name_col FROM invoices
            UNION ALL
            SELECT id, sales_return_date AS date_col, CONCAT('Sales Return #', id) AS details, 0 AS debit, grand_total AS credit, customer_name AS name_col FROM sales_return
            UNION ALL
            SELECT id, TransactionDate AS date_col, CONCAT('Receipt #', id, ' (', Details, ')') AS details, 0 AS debit, TransactionAmount AS credit, customer_name AS name_col FROM receipts
            UNION ALL
            SELECT id, purchase_date AS date_col, CONCAT('Purchase Bill #', id) AS details, 0 AS debit, grand_total AS credit, supplier_name AS name_col FROM purchases
            UNION ALL
            SELECT id, purchase_return_date AS date_col, CONCAT('Purchase Return #', id) AS details, grand_total AS debit, 0 AS credit, customer_name AS name_col FROM purchase_return
            UNION ALL
            SELECT id, VoucherDate AS date_col, CONCAT('Payment Voucher #', id, ' (', Details, ')') AS details, Amount AS debit, 0 AS credit, SupplierName AS name_col FROM vouchers
            UNION ALL
            SELECT id, credit_note_date AS date_col, CONCAT('Credit Note #', id) AS details, 0 AS debit, grand_total AS credit, customer_name AS name_col FROM credit_note
            UNION ALL
            SELECT id, debit_note_date AS date_col, CONCAT('Debit Note #', id) AS details, grand_total AS debit, 0 AS credit, customer_name AS name_col FROM debit_note
        ) AS combined
        WHERE LOWER(TRIM(name_col)) = LOWER(TRIM(?))
        ${dateFilter}
        ORDER BY date_col ASC, id ASC
    `;

    const finalParams = [name, ...params];
    const customerSql = "SELECT receivable_opening_balance FROM customers WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))";
    const supplierSql = "SELECT payable_opening_balance FROM supplier WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))";

    try {
        const [rows] = await db.promise().query(sql, finalParams);
        const [customerRows] = await db.promise().query(customerSql, [name]);
        const [supplierRows] = await db.promise().query(supplierSql, [name]);

        const receivableOpening = customerRows[0]?.receivable_opening_balance || 0;
        const payableOpening = supplierRows[0]?.payable_opening_balance || 0;

        // Split into debits and credits
        let debits = rows.filter(r => r.debit > 0);
        let credits = rows.filter(r => r.credit > 0);

        let totalDebit = debits.reduce((sum, r) => sum + Number(r.debit), 0);
        let totalCredit = credits.reduce((sum, r) => sum + Number(r.credit), 0);

        // User requested: 
        // receivable opening -> openingCredit (Renamed to Opening Receivable Balance on frontend)
        // payable opening -> openingDebit (Renamed to Opening Payable Balance on frontend)
        const openingDebit = Number(payableOpening);
        const openingCredit = Number(receivableOpening);

        totalDebit += openingDebit;
        totalCredit += openingCredit;

        const outstanding = totalDebit - totalCredit;

        res.json({
            rows,
            debits,
            credits,
            totalDebit,
            totalCredit,
            outstanding,
            openingDebit,
            openingCredit
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

export default router;
