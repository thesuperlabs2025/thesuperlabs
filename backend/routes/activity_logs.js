import express from "express";
import db from "../db.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// ✅ GET all activity logs (Admin only)
router.get("/", verifyToken, isAdmin, (req, res) => {
    const { table_name, action, start_date, end_date } = req.query;
    let sql = "SELECT * FROM activity_logs WHERE 1=1";
    const params = [];

    if (table_name) {
        sql += " AND table_name = ?";
        params.push(table_name);
    }
    if (action) {
        sql += " AND action = ?";
        params.push(action);
    }
    if (start_date && end_date) {
        sql += " AND timestamp BETWEEN ? AND ?";
        params.push(`${start_date} 00:00:00`, `${end_date} 23:59:59`);
    }

    sql += " ORDER BY timestamp DESC LIMIT 1000";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

export default router;
