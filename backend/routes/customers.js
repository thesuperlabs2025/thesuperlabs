import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";


const router = express.Router();

// ✅ GET all customer names (for duplicate check)
router.get("/names", (req, res) => {
  const sql = "SELECT name FROM customers";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const names = results.map(r => r.name);
    res.json(names);
  });
});

// ✅ GET customers (with optional search)
router.get("/", (req, res) => {
  const { term } = req.query;

  if (term) {
    const sql = "SELECT DISTINCT name, id, mobile, billing_address, gst_tin AS gst, igst, tds, tcs, discount, price_list FROM customers WHERE name LIKE ? ORDER BY name ASC LIMIT 10";
    db.query(sql, [`${term}%`], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  } else {
    const sql = "SELECT * FROM customers";
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  }
});

// ✅ GET single customer by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM customers WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Customer not found" });
    res.json(results[0]);
  });
});

router.post("/", (req, res) => {
  const fields = [
    "name", "display_name", "mobile", "gst_tin", "whatsapp_no", "email", "igst",
    "discount", "contact_type", "credit_limit", "credit_days", "agent_name",
    "agent_percentage", "tds", "tcs", "pan", "tan", "cin", "bank_name", "branch", "account_number", "ifsc_code", "upi_name", "upi_id", "price_list", "receivable_opening_balance",
    "payable_opening_balance", "billing_address", "billing_country",
    "billing_state", "billing_city", "billing_zip", "shipping_address",
    "shipping_country", "shipping_state", "shipping_city", "shipping_zip"
  ];

  // ✅ convert empty numeric values to 0
  const numberFields = [
    "discount", "credit_limit", "credit_days",
    "agent_percentage", "tds",
    "receivable_opening_balance", "payable_opening_balance"
  ];

  const values = fields.map(f => {
    if (numberFields.includes(f)) {
      const v = parseFloat(req.body[f]);
      return isNaN(v) ? 0 : v;
    }
    return req.body[f] ?? null;
  });

  const placeholders = fields.map(() => "?").join(",");
  const sql = `INSERT INTO customers (${fields.join(",")}) VALUES (${placeholders})`;

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ SQL Error:", err.sqlMessage);
      return res.status(500).json({ error: err.sqlMessage });
    }

    res.json({
      message: "✅ Customer created successfully",
      id: result.insertId
    });
  });
});


// ✅ UPDATE customer
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const fields = [
    "name", "display_name", "mobile", "gst_tin", "whatsapp_no", "email", "igst",
    "discount", "contact_type", "credit_limit", "credit_days", "agent_name",
    "agent_percentage", "tds", "tcs", "pan", "tan", "cin", "bank_name", "branch", "account_number", "ifsc_code", "upi_name", "upi_id", "price_list", "receivable_opening_balance",
    "payable_opening_balance", "billing_address", "billing_country",
    "billing_state", "billing_city", "billing_zip", "shipping_address",
    "shipping_country", "shipping_state", "shipping_city", "shipping_zip"
  ];

  const updates = fields.map(f => `${f} = ?`).join(", ");
  const numberFields = [
    "discount", "credit_limit", "credit_days",
    "agent_percentage", "tds",
    "receivable_opening_balance", "payable_opening_balance"
  ];

  const values = fields.map(f => {
    if (numberFields.includes(f)) {
      const val = parseFloat(req.body[f]);
      return isNaN(val) ? 0 : val;
    }
    return req.body[f] ?? null;
  });
  values.push(id);



  const sql = `UPDATE customers SET ${updates} WHERE id = ?`;

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "✅ Customer updated successfully" });
  });
});

// ✅ DELETE customer
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM customers WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "🗑️ Customer deleted successfully" });
  });
});

export default router;
