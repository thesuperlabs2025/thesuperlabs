import express from "express";
import db from "../db.js";

const router = express.Router();

// Get all fabrics or search by term
router.get("/", (req, res) => {
    const term = req.query.term;
    let sql = "SELECT * FROM fabrics";
    let params = [];
    if (term) {
        sql += " WHERE fabric_name LIKE ? OR fabric_sku LIKE ?";
        params = [`%${term}%`, `%${term}%`];
    }
    sql += " ORDER BY id DESC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get single fabric
router.get("/:id", (req, res) => {
    db.query("SELECT * FROM fabrics WHERE id = ?", [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Fabric not found" });
        res.json(results[0]);
    });
});

// Create fabric
router.post("/", (req, res) => {
    const { fabric_sku, counts, fabric_name, color, gsm, dia, composition, minimum_stock } = req.body;

    // Check if SKU already exists
    db.query("SELECT id FROM fabrics WHERE fabric_sku = ?", [fabric_sku], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            return res.status(400).json({ error: "Duplicate Fabric SKU. This combination already exists." });
        }

        const sql = "INSERT INTO fabrics (fabric_sku, counts, fabric_name, color, gsm, dia, composition, minimum_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        db.query(sql, [fabric_sku, counts, fabric_name, color, gsm, dia, composition, minimum_stock || 0], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Fabric created", id: result.insertId });
        });
    });
});

// Update fabric
router.put("/:id", (req, res) => {
    const { fabric_sku, counts, fabric_name, color, gsm, dia, composition, minimum_stock } = req.body;

    // Check if SKU already exists for another fabric
    db.query("SELECT id FROM fabrics WHERE fabric_sku = ? AND id != ?", [fabric_sku, req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            return res.status(400).json({ error: "Duplicate Fabric SKU. This combination already exists." });
        }

        const sql = "UPDATE fabrics SET fabric_sku=?, counts=?, fabric_name=?, color=?, gsm=?, dia=?, composition=?, minimum_stock=? WHERE id=?";
        db.query(sql, [fabric_sku, counts, fabric_name, color, gsm, dia, composition, minimum_stock || 0, req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Fabric updated" });
        });
    });
});

// Bulk delete fabrics
router.post("/bulk-delete", (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No IDs provided" });
    }
    db.query("DELETE FROM fabrics WHERE id IN (?)", [ids], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `${ids.length} fabrics deleted` });
    });
});

export default router;
