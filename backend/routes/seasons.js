import express from "express";
import db from "../db.js";

const router = express.Router();

// Get all seasons
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM seasons ORDER BY name ASC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create season
router.post("/", async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Season name is required" });
    try {
        const [result] = await db.promise().query("INSERT INTO seasons (name) VALUES (?)", [name]);
        res.status(201).json({ message: "Season created", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update season
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        await db.promise().query("UPDATE seasons SET name = ? WHERE id = ?", [name, id]);
        res.json({ message: "Season updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete season
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.promise().query("DELETE FROM seasons WHERE id = ?", [id]);
        res.json({ message: "Season deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
