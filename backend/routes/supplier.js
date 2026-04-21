import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";

const router = express.Router();

router.get("/names", (req, res) => {
  const sql = "SELECT name FROM supplier";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const names = results.map(r => r.name);
    res.json(names);
  });
});

router.get("/supplier", (req, res) => {
  const term = req.query.term || "";
  const sql = `SELECT id,name FROM supplier WHERE name LIKE ? LIMIT 10`;
  db.query(sql, [`%${term}%`], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.get("/", (req, res) => {
  const term = req.query.term;
  let sql = "SELECT * FROM supplier";
  let params = [];

  if (term) {
    sql += " WHERE name LIKE ?";
    params.push(`%${term}%`);
  }

  sql += " ORDER BY id DESC LIMIT 50";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("SQL Error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ===== GET single customer =====


// ===== GET single supplier =====
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM supplier WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Supplier not found" });
    res.json(results[0]);
  });
});

// ===== POST new customer =====



// ===== POST new supplier =====
router.post("/", (req, res) => {
  const fields = [
    "name", "mobile", "whatsapp_no", "email", "gst_tin", "discount", "contact_type", "cin",
    "receivable_opening_balance", "payable_opening_balance", "bank_name", "branch", "account_number", "ifsc_code", "upi_name", "upi_id",
    "billing_address", "billing_country", "billing_state", "billing_city", "billing_zip",
    "shipping_address", "shipping_country", "shipping_state", "shipping_city", "shipping_zip"
  ];

  // Map values from request body; cast numbers for decimals
  const values = fields.map(f => {
    if (["discount", "receivable_opening_balance", "payable_opening_balance"].includes(f)) {
      const val = parseFloat(req.body[f]);
      return isNaN(val) ? 0 : val; // default 0 if empty
    }
    return req.body[f] ?? null;
  });

  const placeholders = fields.map(() => "?").join(",");
  const sql = `INSERT INTO supplier (${fields.join(",")}) VALUES (${placeholders})`;

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("SQL Error:", err); // full error logged
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "✅ Supplier created successfully", id: result.insertId });
  });
});

// ===== UPDATE customer =====


// ===== DELETE customer =====


// ===== DELETE supplier =====
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM supplier WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Supplier not found" });
    res.json({ message: "🗑️ Supplier deleted successfully" });
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const fields = [
    "name", "mobile", "whatsapp_no", "email", "gst_tin", "discount", "contact_type", "cin",
    "receivable_opening_balance", "payable_opening_balance", "bank_name", "branch", "account_number", "ifsc_code", "upi_name", "upi_id",
    "billing_address", "billing_country", "billing_state", "billing_city", "billing_zip",
    "shipping_address", "shipping_country", "shipping_state", "shipping_city", "shipping_zip"
  ];

  const updates = fields.map(f => `${f} = ?`).join(", ");
  const values = fields.map(f => req.body[f] ?? null);
  values.push(id);

  const sql = `UPDATE supplier SET ${updates} WHERE id = ?`;
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Supplier not found" });
    res.json({ message: "✅ Supplier updated successfully" });
  });
});

export default router;