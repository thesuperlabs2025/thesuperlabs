import express from "express";
import db from "../db.js";

const router = express.Router();

// GET all UOMs
router.get("/", (req, res) => {
    db.query("SELECT * FROM uom ORDER BY id DESC", (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

// GET single UOM
router.get("/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM uom WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "UOM not found" });
        res.json(results[0]);
    });
});

// CREATE new UOM
router.post("/", (req, res) => {
    const { name } = req.body;
    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "UOM name is required" });
    }

    // Check duplicate
    db.query("SELECT * FROM uom WHERE name = ?", [name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0) return res.status(409).json({ error: "UOM already exists" });

        const sql = "INSERT INTO uom (name) VALUES (?)";
        db.query(sql, [name], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "UOM created successfully", id: result.insertId });
        });
    });
});

// UPDATE UOM
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "UOM name is required" });
    }

    // Check duplicate (excluding self)? Optional but good practice.
    // For now, simpler update is fine unless name exists.

    const sql = "UPDATE uom SET name = ? WHERE id = ?";
    db.query(sql, [name, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "UOM updated successfully" });
    });
});

// DELETE UOM
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM uom WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "UOM not found" });
        res.json({ message: "UOM deleted successfully" });
    });
});

export default router;
