import express from "express";
import db from "../db.js";

const router = express.Router();

// GET outstanding balance by customer name (callback style)
router.get("/:customer_name", (req, res) => {
  const { customer_name } = req.params;

  const query = `
    SELECT
      (COALESCE(c.receivable_opening_balance, 0) + COALESCE(s.receivable_opening_balance, 0) + COALESCE(inv.total, 0) - COALESCE(rec.total, 0)) AS outstanding_balance
    FROM (SELECT ? AS name) n
    LEFT JOIN customers c ON LOWER(n.name) = LOWER(c.name)
    LEFT JOIN supplier s ON LOWER(n.name) = LOWER(s.name)
    LEFT JOIN (SELECT customer_name, SUM(grand_total) AS total FROM invoices WHERE LOWER(customer_name) = LOWER(?) GROUP BY customer_name) inv ON 1=1
    LEFT JOIN (SELECT customer_name, SUM(TransactionAmount) AS total FROM receipts WHERE LOWER(customer_name) = LOWER(?) GROUP BY customer_name) rec ON 1=1
  `;

  db.query(query, [customer_name, customer_name, customer_name], (err, rows) => {
    if (err) {
      console.error("❌ DB error:", err);
      return res.status(500).json({ error: "Server error" });
    }

    res.json({
      outstanding_balance: Number(rows[0]?.outstanding_balance || 0)
    });
  });
});


router.get("/", (req, res) => {
  const { customer_name } = req.query;

  let query = `
    SELECT 
      names.contact_name,
      (COALESCE(cust.receivable_opening_balance, 0) + COALESCE(supp.receivable_opening_balance, 0) + COALESCE(inv.total, 0) - COALESCE(rec.total, 0)) AS receivable_outstanding,
      (COALESCE(cust.payable_opening_balance, 0) + COALESCE(supp.payable_opening_balance, 0) + COALESCE(pur.total, 0) - COALESCE(vou.total, 0)) AS payable_outstanding
    FROM (
      SELECT name AS contact_name FROM customers
      UNION
      SELECT name AS contact_name FROM supplier
    ) AS names
    LEFT JOIN (SELECT name, receivable_opening_balance, payable_opening_balance FROM customers) cust ON LOWER(names.contact_name) = LOWER(cust.name)
    LEFT JOIN (SELECT name, receivable_opening_balance, payable_opening_balance FROM supplier) supp ON LOWER(names.contact_name) = LOWER(supp.name)
    LEFT JOIN (SELECT customer_name, SUM(grand_total) AS total FROM invoices GROUP BY customer_name) inv ON LOWER(names.contact_name) = LOWER(inv.customer_name)
    LEFT JOIN (SELECT customer_name, SUM(TransactionAmount) AS total FROM receipts GROUP BY customer_name) rec ON LOWER(names.contact_name) = LOWER(rec.customer_name)
    LEFT JOIN (SELECT supplier_name, SUM(grand_total) AS total FROM purchases GROUP BY supplier_name) pur ON LOWER(names.contact_name) = LOWER(pur.supplier_name)
    LEFT JOIN (SELECT SupplierName, SUM(Amount) AS total FROM vouchers GROUP BY SupplierName) vou ON LOWER(names.contact_name) = LOWER(vou.SupplierName)
    WHERE 1=1
  `;

  const params = [];
  if (customer_name) {
    query += " AND names.contact_name LIKE ?";
    params.push(`%${customer_name}%`);
  }

  query += " ORDER BY names.contact_name ASC";

  db.query(query, params, (err, rows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Server error" });
    }

    const data = rows.map((row) => ({
      customer_name: row.contact_name,
      receivable_outstanding: Number(row.receivable_outstanding || 0),
      payable_outstanding: Number(row.payable_outstanding || 0),
    }));

    res.json(data);
  });
});



export default router;
