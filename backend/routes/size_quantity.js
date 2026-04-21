import express from "express";
import db from "../db.js";

const router = express.Router();

// Save Size Quantity Details
router.post("/", async (req, res) => {
    const { order_id, style_name, color, size_chart_id, size_chart_name, total_qty, excess_pct, final_qty, items } = req.body;

    db.getConnection(async (err, conn) => {
        if (err) return res.status(500).json({ error: "DB Connection failed" });

        try {
            await conn.promise().beginTransaction();

            // Clear existing if any for this order
            if (order_id) {
                const [existing] = await conn.promise().query("SELECT id FROM size_quantity WHERE order_id = ?", [order_id]);
                for (const row of existing) {
                    await conn.promise().query("DELETE FROM size_quantity_items WHERE size_quantity_id = ?", [row.id]);
                }
                await conn.promise().query("DELETE FROM size_quantity WHERE order_id = ?", [order_id]);
            }

            const [mainResult] = await conn.promise().query(
                "INSERT INTO size_quantity (order_id, style_name, color_name, size_chart_id, size_chart_name, total_qty, excess_pct, final_qty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [order_id || null, style_name || null, color || null, size_chart_id, size_chart_name, total_qty || 0, excess_pct || 0, final_qty || 0]
            );

            const mainId = mainResult.insertId;

            if (items && items.length > 0) {
                const itemValues = items.map(item => [
                    mainId,
                    item.style_name,
                    item.style_part,
                    item.color,
                    item.pcs_qty || 0,
                    JSON.stringify(item.sizes_data || {})
                ]);

                await conn.promise().query(
                    "INSERT INTO size_quantity_items (size_quantity_id, style_name, style_part, color, pcs_qty, sizes_data) VALUES ?",
                    [itemValues]
                );
            }

            await conn.promise().commit();
            res.json({ message: "Size Quantity saved", id: mainId });
        } catch (error) {
            await conn.promise().rollback();
            res.status(500).json({ error: error.message });
        } finally {
            conn.release();
        }
    });
});

// Get list
router.get("/", (req, res) => {
    db.query("SELECT * FROM size_quantity ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get by Order ID
router.get("/order/:orderId", (req, res) => {
    const { orderId } = req.params;
    if (!orderId || orderId === 'undefined' || orderId === 'null') {
        return res.json({ items: [] });
    }
    db.query("SELECT * FROM size_quantity WHERE order_id = ?", [orderId], (err, main) => {
        if (err) return res.status(500).json({ error: err.message });
        if (main.length === 0) {
            return res.status(200).json({
                id: null,
                order_id: orderId,
                style_name: "",
                color_name: "",
                size_chart_id: null,
                size_chart_name: "",
                total_qty: 0,
                excess_pct: 0,
                final_qty: 0,
                items: []
            });
        }

        const id = main[0].id;
        db.query("SELECT * FROM size_quantity_items WHERE size_quantity_id = ?", [id], (err, items) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...main[0], items });
        });
    });
});

// Get by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM size_quantity WHERE id = ?", [id], (err, main) => {
        if (err) return res.status(500).json({ error: err.message });
        if (main.length === 0) return res.status(404).json({ error: "Not found" });

        db.query("SELECT * FROM size_quantity_items WHERE size_quantity_id = ?", [id], (err, items) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...main[0], items });
        });
    });
});

export default router;
