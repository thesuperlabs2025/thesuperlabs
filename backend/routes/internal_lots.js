import express from "express";
import db from "../db.js";

const router = express.Router();

// Get next internal lot number
router.get("/next-no", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const sql = "SELECT internal_lot_no FROM internal_lots WHERE year_id = ? ORDER BY id DESC LIMIT 1";
    db.query(sql, [yearId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        let nextNo = "ILOT-001";
        if (results.length > 0) {
            const lastNo = results[0].internal_lot_no;
            const match = lastNo.match(/ILOT-(\d+)/);
            if (match) {
                const num = parseInt(match[1]) + 1;
                nextNo = `ILOT-${num.toString().padStart(3, '0')}`;
            }
        }
        res.json({ internal_lot_no: nextNo });
    });
});

// Get all internal lots
router.get("/", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const sql = "SELECT * FROM internal_lots WHERE year_id = ? ORDER BY id DESC";
    db.query(sql, [yearId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get single internal lot
router.get("/:id", (req, res) => {
    const sql = "SELECT * FROM internal_lots WHERE id = ?";
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Lot not found" });
        res.json(results[0]);
    });
});

// Create internal lot
router.post("/", (req, res) => {
    const { internal_lot_no, internal_lot_name, status } = req.body;
    const yearId = req.headers['x-year-id'];
    const sql = "INSERT INTO internal_lots (internal_lot_no, internal_lot_name, status, year_id) VALUES (?, ?, ?, ?)";
    db.query(sql, [internal_lot_no, internal_lot_name, status || 'Pending', yearId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Internal lot created", id: result.insertId });
    });
});

// Update internal lot
router.put("/:id", (req, res) => {
    const { internal_lot_name, status } = req.body;
    const sql = "UPDATE internal_lots SET internal_lot_name = ?, status = ? WHERE id = ?";
    db.query(sql, [internal_lot_name, status, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Internal lot updated" });
    });
});

// Delete internal lot
router.delete("/:id", (req, res) => {
    db.query("DELETE FROM internal_lots WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Internal lot deleted" });
    });
});

export default router;
