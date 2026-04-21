import express from "express";
import db from "../db.js";

const router = express.Router();

// Get next lot number
router.get("/next-no", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const sql = "SELECT lot_no FROM production_lots WHERE year_id = ? ORDER BY id DESC LIMIT 1";
    db.query(sql, [yearId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        let nextNo = "LOT-001";
        if (results.length > 0) {
            const lastNo = results[0].lot_no;
            const num = parseInt(lastNo.split("-")[1]) + 1;
            nextNo = `LOT-${num.toString().padStart(3, '0')}`;
        }
        res.json({ lot_no: nextNo });
    });
});

// Get all production lots
router.get("/", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const sql = `
        SELECT pl.*, GROUP_CONCAT(plo.order_no SEPARATOR ', ') as orders
        FROM production_lots pl
        LEFT JOIN production_lot_orders plo ON pl.id = plo.lot_id
        WHERE pl.year_id = ?
        GROUP BY pl.id
        ORDER BY pl.id DESC
    `;
    db.query(sql, [yearId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get single production lot
router.get("/:id", (req, res) => {
    const plSql = "SELECT * FROM production_lots WHERE id = ?";
    const ordersSql = "SELECT * FROM production_lot_orders WHERE lot_id = ?";

    db.query(plSql, [req.params.id], (err, plResults) => {
        if (err) return res.status(500).json({ error: err.message });
        if (plResults.length === 0) return res.status(404).json({ message: "Lot not found" });

        db.query(ordersSql, [req.params.id], (err, orderResults) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...plResults[0], orders: orderResults });
        });
    });
});

// Create production lot
router.post("/", async (req, res) => {
    const { lot_no, lot_name, status, orders } = req.body;

    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();

        const yearId = req.headers['x-year-id'];
        const [plResult] = await conn.query(
            "INSERT INTO production_lots (lot_no, lot_name, status, year_id) VALUES (?, ?, ?, ?)",
            [lot_no, lot_name, status || 'Pending', yearId]
        );

        const lotId = plResult.insertId;

        if (orders && orders.length > 0) {
            const orderValues = orders.map(o => {
                let d = null;
                try {
                    if (o.order_date) {
                        const parsedDate = new Date(o.order_date);
                        if (!isNaN(parsedDate.getTime())) {
                            d = parsedDate.toISOString().split('T')[0];
                        }
                    }
                } catch (e) {
                    console.error("Date parsing error for order:", o.order_no, e.message);
                }
                return [
                    lotId,
                    o.order_planning_id || o.order_id || o.id || null,
                    o.order_no || null,
                    d
                ];
            });
            await conn.query(
                "INSERT INTO production_lot_orders (lot_id, order_planning_id, order_no, order_date) VALUES ?",
                [orderValues]
            );
        }

        await conn.commit();
        res.status(201).json({ message: "Production lot created", id: lotId });
    } catch (err) {
        console.error("Error in POST /api/production-lots:", err.message);
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// Update production lot
router.put("/:id", async (req, res) => {
    const { lot_name, status, orders } = req.body;
    const lotId = req.params.id;

    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();

        await conn.query(
            "UPDATE production_lots SET lot_name = ?, status = ? WHERE id = ?",
            [lot_name, status, lotId]
        );

        // Delete existing orders and re-insert
        await conn.query("DELETE FROM production_lot_orders WHERE lot_id = ?", [lotId]);

        if (orders && orders.length > 0) {
            const orderValues = orders.map(o => {
                let d = null;
                try {
                    if (o.order_date) {
                        const parsedDate = new Date(o.order_date);
                        if (!isNaN(parsedDate.getTime())) {
                            d = parsedDate.toISOString().split('T')[0];
                        }
                    }
                } catch (e) {
                    console.error("Date parsing error for order:", o.order_no, e.message);
                }
                return [
                    lotId,
                    o.order_planning_id || o.order_id || o.id || null,
                    o.order_no || null,
                    d
                ];
            });
            await conn.query(
                "INSERT INTO production_lot_orders (lot_id, order_planning_id, order_no, order_date) VALUES ?",
                [orderValues]
            );
        }

        await conn.commit();
        res.json({ message: "Production lot updated" });
    } catch (err) {
        console.error("Error in PUT /api/production-lots:", err.message);
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// Delete production lot
router.delete("/:id", (req, res) => {
    db.query("DELETE FROM production_lots WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Production lot deleted" });
    });
});

export default router;
