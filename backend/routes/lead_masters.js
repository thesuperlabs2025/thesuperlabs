import express from "express";
import db from "../db.js";

const router = express.Router();

// Generic handler for Lead Masters
const setupMasterRoutes = (tableName) => {
    // Get all
    router.get(`/${tableName}`, async (req, res) => {
        try {
            const [rows] = await db.promise().query(`SELECT * FROM ${tableName} ORDER BY name ASC`);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Create
    router.post(`/${tableName}`, async (req, res) => {
        const { name, color } = req.body;
        try {
            const query = color
                ? `INSERT INTO ${tableName} (name, color) VALUES (?, ?)`
                : `INSERT INTO ${tableName} (name) VALUES (?)`;
            const values = color ? [name, color] : [name];
            const [result] = await db.promise().query(query, values);
            res.json({ message: "Created successfully", id: result.insertId });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Update
    router.put(`/${tableName}/:id`, async (req, res) => {
        const { id } = req.params;
        const { name, color } = req.body;
        try {
            const query = color
                ? `UPDATE ${tableName} SET name = ?, color = ? WHERE id = ?`
                : `UPDATE ${tableName} SET name = ? WHERE id = ?`;
            const values = color ? [name, color, id] : [name, id];
            await db.promise().query(query, values);
            res.json({ message: "Updated successfully" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Delete
    router.delete(`/${tableName}/:id`, async (req, res) => {
        const { id } = req.params;
        try {
            await db.promise().query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
            res.json({ message: "Deleted successfully" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
};

setupMasterRoutes("lead_sources");
setupMasterRoutes("product_types");
setupMasterRoutes("lead_statuses");

export default router;
