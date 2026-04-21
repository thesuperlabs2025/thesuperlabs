import express from "express";
import db from "../db.js";

const router = express.Router();

// Get all life cycle processes (use sort_order so Operation Life Cycle order matches job outward/inward)
router.get("/", (req, res) => {
    const q = "SELECT * FROM life_cycles ORDER BY sort_order ASC, id ASC";
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(data);
    });
});

// Save/Bulk Save life cycle processes
router.post("/save-all", (req, res) => {
    const { processes } = req.body;

    // The user wants a clean state usually or we can update. 
    // Given the UI shows a table where rows can be added/removed, a bulk sync is easiest.

    // 1. Delete all existing (or we could do upsert, but for master simple sync is often preferred)
    db.query("DELETE FROM life_cycles", (err) => {
        if (err) return res.status(500).json(err);

        if (!processes || processes.length === 0) {
            return res.status(200).json("Cleared successfully");
        }

        const q = "INSERT INTO life_cycles (process_name, process_type, wastage, sort_order) VALUES ?";
        const values = processes.map(p => [p.processName, p.type, p.wastage || 0, p.sortOrder || 0]);

        db.query(q, [values], (err) => {
            if (err) return res.status(500).json(err);
            res.status(200).json("Life cycles saved successfully");
        });
    });
});

export default router;
