import express from "express";
import db from "../db.js";

const router = express.Router();

// ─── Auto-create table if not exists ─────────────────────────────────────────
db.query(`CREATE TABLE IF NOT EXISTS contractor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    whatsapp_no VARCHAR(20),
    email VARCHAR(100),
    gst_tin VARCHAR(50),
    billing_address TEXT,
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_zip VARCHAR(20),
    bank_name VARCHAR(255),
    branch VARCHAR(255),
    account_number VARCHAR(100),
    ifsc_code VARCHAR(50),
    upi_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) console.error("Error creating contractor table:", err);
});

// ─── GET all contractors ───────────────────────────────────────────────────
router.get("/", (req, res) => {
    const sql = "SELECT * FROM contractor ORDER BY name ASC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ─── GET contractors for autocomplete ──────────────────────────────────────
router.get("/search", (req, res) => {
    const term = req.query.term || "";
    const sql = "SELECT id, name FROM contractor WHERE name LIKE ? LIMIT 10";
    db.query(sql, [`%${term}%`], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ─── GET single contractor ──────────────────────────────────────────────────
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM contractor WHERE id = ?";
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Contractor not found" });
        res.json(results[0]);
    });
});

// ─── POST new contractor ────────────────────────────────────────────────────
router.post("/", (req, res) => {
    const fields = [
        "name", "mobile", "whatsapp_no", "email", "gst_tin",
        "billing_address", "billing_city", "billing_state", "billing_zip",
        "bank_name", "branch", "account_number", "ifsc_code", "upi_id"
    ];
    const values = fields.map(f => req.body[f] ?? null);
    const placeholders = fields.map(() => "?").join(",");
    const sql = `INSERT INTO contractor (${fields.join(",")}) VALUES (${placeholders})`;

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "✅ Contractor created successfully", id: result.insertId });
    });
});

// ─── PUT update contractor ──────────────────────────────────────────────────
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const fields = [
        "name", "mobile", "whatsapp_no", "email", "gst_tin",
        "billing_address", "billing_city", "billing_state", "billing_zip",
        "bank_name", "branch", "account_number", "ifsc_code", "upi_id"
    ];

    const updates = fields.map(f => `${f} = ?`).join(", ");
    const values = fields.map(f => req.body[f] ?? null);
    values.push(id);

    const sql = `UPDATE contractor SET ${updates} WHERE id = ?`;
    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Contractor not found" });
        res.json({ message: "✅ Contractor updated successfully" });
    });
});

// ─── DELETE contractor ──────────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM contractor WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Contractor not found" });
        res.json({ message: "🗑️ Contractor deleted successfully" });
    });
});

export default router;
