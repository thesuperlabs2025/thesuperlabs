import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const { startDate, endDate } = req.query;

    let dateFilterInvoices = "";
    let dateFilterSalesReturn = "";
    let dateFilterPurchases = "";
    let dateFilterPurchaseReturn = "";
    let dateFilterVouchers = "";
    let params = [];

    if (startDate && endDate) {
        dateFilterInvoices = "WHERE invoice_date BETWEEN ? AND ?";
        dateFilterSalesReturn = "WHERE sales_return_date BETWEEN ? AND ?";
        dateFilterPurchases = "WHERE purchase_date BETWEEN ? AND ?";
        dateFilterPurchaseReturn = "WHERE purchase_return_date BETWEEN ? AND ?";
        dateFilterVouchers = "WHERE VoucherDate BETWEEN ? AND ?";
        params = [startDate, endDate];
    }

    try {
        const query = (sql, p) => db.promise().query(sql, p);

        const [salesRes] = await query(`SELECT IFNULL(SUM(grand_total), 0) as total FROM invoices ${dateFilterInvoices}`, params);
        const [salesReturnRes] = await query(`SELECT IFNULL(SUM(grand_total), 0) as total FROM sales_return ${dateFilterSalesReturn}`, params);
        const [purchaseRes] = await query(`SELECT IFNULL(SUM(grand_total), 0) as total FROM purchases ${dateFilterPurchases}`, params);
        const [purchaseReturnRes] = await query(`SELECT IFNULL(SUM(grand_total), 0) as total FROM purchase_return ${dateFilterPurchaseReturn}`, params);
        const [voucherRes] = await query(`SELECT IFNULL(SUM(Amount), 0) as total FROM vouchers ${dateFilterVouchers}`, params);

        const total_sales = Number(salesRes[0].total);
        const total_sales_return = Number(salesReturnRes[0].total);
        const total_purchase = Number(purchaseRes[0].total);
        const total_purchase_return = Number(purchaseReturnRes[0].total);
        const total_voucher = Number(voucherRes[0].total);

        const net_sales = total_sales - total_sales_return;
        const net_purchase = total_purchase - total_purchase_return;
        const profit = net_sales - net_purchase - total_voucher;

        res.json({
            total_sales,
            total_sales_return,
            net_sales,
            total_purchase,
            total_purchase_return,
            net_purchase,
            total_voucher,
            profit
        });
    } catch (err) {
        console.error("Profit Loss Report Error:", err);
        res.status(500).json({ error: "Internal server error", message: err.sqlMessage || err.message });
    }
});

export default router;
