import express from "express";
import db from "../db.js";

const router = express.Router();

// Get all yarn or search by term
router.get("/", (req, res) => {
    const term = req.query.term;
    let sql = "SELECT * FROM yarn";
    let params = [];
    if (term) {
        sql += " WHERE yarn_name LIKE ? OR yarn_sku LIKE ?";
        params = [`%${term}%`, `%${term}%`];
    }
    sql += " ORDER BY id DESC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get single yarn
router.get("/:id", (req, res) => {
    db.query("SELECT * FROM yarn WHERE id = ?", [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Yarn not found" });
        res.json(results[0]);
    });
});

// Create yarn
router.post("/", (req, res) => {
    const { yarn_sku, counts, yarn_name, color, composition, minimum_stock } = req.body;

    // Check if SKU already exists
    db.query("SELECT id FROM yarn WHERE yarn_sku = ?", [yarn_sku], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            return res.status(400).json({ error: "Duplicate Yarn SKU. This combination already exists." });
        }

        const sql = "INSERT INTO yarn (yarn_sku, counts, yarn_name, color, composition, minimum_stock) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(sql, [yarn_sku, counts, yarn_name, color, composition, minimum_stock || 0], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Yarn created", id: result.insertId });
        });
    });
});

// Update yarn
router.put("/:id", (req, res) => {
    const { yarn_sku, counts, yarn_name, color, composition, minimum_stock } = req.body;

    // Check if SKU already exists for another yarn
    db.query("SELECT id FROM yarn WHERE yarn_sku = ? AND id != ?", [yarn_sku, req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            return res.status(400).json({ error: "Duplicate Yarn SKU. This combination already exists." });
        }

        const sql = "UPDATE yarn SET yarn_sku=?, counts=?, yarn_name=?, color=?, composition=?, minimum_stock=? WHERE id=?";
        db.query(sql, [yarn_sku, counts, yarn_name, color, composition, minimum_stock || 0, req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Yarn updated" });
        });
    });
});

// Bulk delete yarn
router.post("/bulk-delete", (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No IDs provided" });
    }
    db.query("DELETE FROM yarn WHERE id IN (?)", [ids], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `${ids.length} yarn records deleted` });
    });
});

export default router;
