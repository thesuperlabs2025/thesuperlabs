import express from "express";
import db from "../db.js";

const router = express.Router();

// Get all dia masters
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM dia_master ORDER BY dia_name ASC");
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get single dia master with values
router.get("/:id", async (req, res) => {
    try {
        const [master] = await db.promise().query("SELECT * FROM dia_master WHERE id = ?", [req.params.id]);
        if (master.length === 0) return res.status(404).json("Dia master not found");

        const [values] = await db.promise().query("SELECT * FROM dia_master_values WHERE dia_id = ?", [req.params.id]);

        const sizeData = {};
        values.forEach(v => {
            sizeData[v.size] = v.dia_value;
        });

        res.status(200).json({ ...master[0], sizeData });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Create dia master
router.post("/", async (req, res) => {
    const { dia_name, size_chart_id, sizeData } = req.body;
    try {
        const [result] = await db.promise().query("INSERT INTO dia_master (dia_name, size_chart_id) VALUES (?, ?)", [dia_name, size_chart_id || null]);
        const dia_id = result.insertId;

        if (sizeData && Object.keys(sizeData).length > 0) {
            const values = Object.entries(sizeData).map(([size, dia_value]) => [dia_id, size, dia_value]);
            await db.promise().query("INSERT INTO dia_master_values (dia_id, size, dia_value) VALUES ?", [values]);
        }

        res.status(200).json("Dia master created successfully");
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update dia master
router.put("/:id", async (req, res) => {
    const { dia_name, size_chart_id, sizeData } = req.body;
    const dia_id = req.params.id;
    try {
        await db.promise().query("UPDATE dia_master SET dia_name = ?, size_chart_id = ? WHERE id = ?", [dia_name, size_chart_id || null, dia_id]);

        await db.promise().query("DELETE FROM dia_master_values WHERE dia_id = ?", [dia_id]);

        if (sizeData && Object.keys(sizeData).length > 0) {
            const values = Object.entries(sizeData).map(([size, dia_value]) => [dia_id, size, dia_value]);
            await db.promise().query("INSERT INTO dia_master_values (dia_id, size, dia_value) VALUES ?", [values]);
        }

        res.status(200).json("Dia master updated successfully");
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete dia master
router.delete("/:id", async (req, res) => {
    try {
        await db.promise().query("DELETE FROM dia_master WHERE id = ?", [req.params.id]);
        res.status(200).json("Dia master deleted successfully");
    } catch (err) {
        res.status(500).json(err);
    }
});

export default router;
