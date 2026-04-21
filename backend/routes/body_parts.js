import express from "express";
import db from "../db.js";

const router = express.Router();

// Get all body parts
router.get("/", (req, res) => {
    db.query("SELECT * FROM body_parts ORDER BY part_name ASC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Create body part
router.post("/", (req, res) => {
    const { part_name } = req.body;
    db.query("INSERT INTO body_parts (part_name) VALUES (?)", [part_name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Body part created", id: result.insertId });
    });
});

// Delete body part
router.delete("/:id", (req, res) => {
    db.query("DELETE FROM body_parts WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Body part deleted" });
    });
});

// Save/Bulk Save body parts
router.post("/save-all", (req, res) => {
    const { parts } = req.body;

    db.query("DELETE FROM body_parts", (err) => {
        if (err) return res.status(500).json(err);

        if (!parts || parts.length === 0) {
            return res.status(200).json("Cleared successfully");
        }

        const q = "INSERT INTO body_parts (part_name) VALUES ?";
        const values = parts.map(p => [p.partName]);

        db.query(q, [values], (err) => {
            if (err) return res.status(500).json(err);
            res.status(200).json("Body parts saved successfully");
        });
    });
});

export default router;
