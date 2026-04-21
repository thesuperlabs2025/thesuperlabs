import express from "express";
import db from "../db.js";

const router = express.Router();

// GET all contractor wages
router.get("/", (req, res) => {
    const sql = "SELECT * FROM contractor_wages ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET specific contractor wages with items
router.get("/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM contractor_wages WHERE id = ?", [id], (err, main) => {
        if (err) return res.status(500).json({ error: err.message });
        if (main.length === 0) return res.status(404).json({ error: "Not found" });

        db.query("SELECT * FROM contractor_wages_items WHERE contractor_wages_id = ?", [id], (err, items) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...main[0], items });
        });
    });
});

// CREATE new contractor wages
router.post("/", (req, res) => {
    const { order_id, order_name, items } = req.body;

    db.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: "DB Connection failed" });

        conn.beginTransaction(async (err) => {
            if (err) {
                conn.release();
                return res.status(500).json({ error: err.message });
            }

            try {
                const [mainResult] = await conn.promise().query(
                    "INSERT INTO contractor_wages (order_id, order_name) VALUES (?, ?)",
                    [order_id, order_name]
                );
                const mainId = mainResult.insertId;

                if (items && items.length > 0) {
                    const itemValues = items.map(i => [
                        mainId,
                        i.style_name,
                        i.color,
                        i.contractor,
                        i.process,
                        i.qty || 0,
                        i.rate || 0,
                        i.total_rate || 0
                    ]);
                    await conn.promise().query(
                        "INSERT INTO contractor_wages_items (contractor_wages_id, style_name, color, contractor, process, qty, rate, total_rate) VALUES ?",
                        [itemValues]
                    );
                }

                await conn.promise().commit();
                res.status(201).json({ message: "Contractor wages created", id: mainId });
            } catch (error) {
                await conn.promise().rollback();
                res.status(500).json({ error: error.message });
            } finally {
                conn.release();
            }
        });
    });
});

// UPDATE contractor wages
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { order_id, order_name, items } = req.body;

    db.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: "DB Connection failed" });

        conn.beginTransaction(async (err) => {
            if (err) {
                conn.release();
                return res.status(500).json({ error: err.message });
            }

            try {
                await conn.promise().query(
                    "UPDATE contractor_wages SET order_id = ?, order_name = ? WHERE id = ?",
                    [order_id, order_name, id]
                );

                await conn.promise().query("DELETE FROM contractor_wages_items WHERE contractor_wages_id = ?", [id]);

                if (items && items.length > 0) {
                    const itemValues = items.map(i => [
                        id,
                        i.style_name,
                        i.color,
                        i.contractor,
                        i.process,
                        i.qty || 0,
                        i.rate || 0,
                        i.total_rate || 0
                    ]);
                    await conn.promise().query(
                        "INSERT INTO contractor_wages_items (contractor_wages_id, style_name, color, contractor, process, qty, rate, total_rate) VALUES ?",
                        [itemValues]
                    );
                }

                await conn.promise().commit();
                res.json({ message: "Contractor wages updated" });
            } catch (error) {
                await conn.promise().rollback();
                res.status(500).json({ error: error.message });
            } finally {
                conn.release();
            }
        });
    });
});

// DELETE contractor wages
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM contractor_wages WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Deleted successfully" });
    });
});

export default router;
