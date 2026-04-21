import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
    db.query("SELECT * FROM price_lists_master ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.post("/", (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    db.query("INSERT INTO price_lists_master (name) VALUES (?)", [name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Price list created", id: result.insertId });
    });
});

router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    db.query("UPDATE price_lists_master SET name = ? WHERE id = ?", [name, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Price list updated" });
    });
});

router.delete("/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM price_lists_master WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Price list deleted" });
    });
});

export default router;
