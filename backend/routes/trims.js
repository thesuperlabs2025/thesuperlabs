import express from "express";
import db from "../db.js";

const router = express.Router();

// Get all trims or search by term
router.get("/", (req, res) => {
    const term = req.query.term;
    let sql = `
        SELECT t.*, sc.chart_name as size_chart_name, 
        (SELECT GROUP_CONCAT(size_value ORDER BY id SEPARATOR ', ') FROM size_chart_values WHERE size_chart_id = t.size_chart_id) as size_values
        FROM trims t 
        LEFT JOIN size_charts sc ON t.size_chart_id = sc.id 
    `;
    let params = [];
    if (term) {
        sql += " WHERE t.trims_name LIKE ? OR t.trims_sku LIKE ?";
        params = [`%${term}%`, `%${term}%`];
    }
    sql += " ORDER BY t.id DESC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get single trim
router.get("/:id", (req, res) => {
    db.query("SELECT * FROM trims WHERE id = ?", [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Trim not found" });
        res.json(results[0]);
    });
});

// Create trim
router.post("/", (req, res) => {
    const { trims_name, trims_sku, color, uom, is_sizable, size_chart_id, minimum_stock } = req.body;

    // Check if SKU already exists
    db.query("SELECT id FROM trims WHERE trims_sku = ?", [trims_sku], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            return res.status(400).json({ error: "Duplicate Trims SKU. This SKU already exists." });
        }

        const sql = "INSERT INTO trims (trims_name, trims_sku, color, uom, is_sizable, size_chart_id, minimum_stock) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.query(sql, [trims_name, trims_sku, color, uom, is_sizable ? 1 : 0, size_chart_id || null, minimum_stock || 0], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Trim created", id: result.insertId });
        });
    });
});

// Update trim
router.put("/:id", (req, res) => {
    const { trims_name, trims_sku, color, uom, is_sizable, size_chart_id, minimum_stock } = req.body;

    // Check if SKU already exists for another trim
    db.query("SELECT id FROM trims WHERE trims_sku = ? AND id != ?", [trims_sku, req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            return res.status(400).json({ error: "Duplicate Trims SKU. This SKU already exists." });
        }

        const sql = "UPDATE trims SET trims_name=?, trims_sku=?, color=?, uom=?, is_sizable=?, size_chart_id=?, minimum_stock=? WHERE id=?";
        db.query(sql, [trims_name, trims_sku, color, uom, is_sizable ? 1 : 0, size_chart_id || null, minimum_stock || 0, req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Trim updated" });
        });
    });
});

// Bulk delete trims
router.post("/bulk-delete", (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No IDs provided" });
    }
    db.query("DELETE FROM trims WHERE id IN (?)", [ids], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `${ids.length} trims deleted` });
    });
});

export default router;
