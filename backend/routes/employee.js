import express from "express";
import multer from "multer";
import path from "path";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";
const router = express.Router();

// ===== Multer Configuration =====
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ===== CREATE Employee =====
router.post("/", upload.single("image"), (req, res) => {
  const { employee_name, mobile, email, address, aadhar_no } = req.body;
  const image = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO employees 
    (employee_name, mobile, email, address, aadhar_no, image) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [employee_name, mobile, email, address, aadhar_no, image], (err, result) => {
    if (err) {
      console.error("❌ Error inserting employee:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "✅ Employee added successfully!", id: result.insertId });
  });
});

// ===== GET all employees (Full Data) =====
router.get("/", (req, res) => {
  const sql = "SELECT * FROM employees ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ===== GET employee names only (for dropdowns, etc.) =====
router.get("/employees", (req, res) => {
  db.query("SELECT employee_name FROM employees", (err, rows) => {
    res.send(rows);
  });
});


// ===== GET Single Employee by ID =====
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM employees WHERE id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching employee:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(results[0]);
  });
});

// ===== UPDATE Employee =====

router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM employees WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json(result[0]);
  });
});
// ✅ Update employee details
router.put("/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { employee_name, mobile, email, address, aadhar_no } = req.body;


  let sql = "";
  let params = [];

  if (req.file) {
    const image = req.file.filename;
    sql = `
      UPDATE employees 
      SET employee_name = ?, mobile = ?, email = ?, address = ?, aadhar_no = ?, image = ?
      WHERE id = ?
    `;
    params = [employee_name, mobile, email, address, aadhar_no, image, id];
  } else {
    sql = `
      UPDATE employees 
      SET employee_name = ?, mobile = ?, email = ?, address = ?, aadhar_no = ?
      WHERE id = ?
    `;
    params = [employee_name, mobile, email, address, aadhar_no, id];
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("❌ Error updating employee:", err);
      return res.status(500).json({ error: "Database update failed" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "✅ Employee updated successfully" });
  });
});

// ===== DELETE Single Employee =====
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM employees WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "🗑️ Employee deleted successfully!" });
  });
});

// ===== DELETE Multiple Employees =====
router.post("/delete-multiple", (req, res) => {
  const { ids } = req.body;
  if (!ids || ids.length === 0)
    return res.status(400).json({ error: "No IDs provided" });

  const sql = `DELETE FROM employees WHERE id IN (${ids.join(",")})`;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "🗑️ Selected employees deleted successfully!" });
  });
});

export default router;
