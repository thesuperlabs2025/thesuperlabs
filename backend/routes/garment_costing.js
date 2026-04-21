import express from "express";
import db from "../db.js";

const router = express.Router();

// Get all costing records
router.get("/", (req, res) => {
    const sql = "SELECT * FROM garment_costing ORDER BY id DESC";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

// Get all versions for an order
router.get("/order/:order_planning_id/versions", (req, res) => {
    const { order_planning_id } = req.params;
    const sql = "SELECT id, version, status, final_fob, updated_at FROM garment_costing WHERE order_planning_id = ? ORDER BY id DESC";
    db.query(sql, [order_planning_id], (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

// Get costing by ID (specific version)
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const sqlCosting = "SELECT * FROM garment_costing WHERE id = ?";

    db.query(sqlCosting, [id], (err, costingData) => {
        if (err) return res.status(500).json({ error: err.message });
        if (costingData.length === 0) return res.status(404).json({ message: "Not found" });

        const costingId = id;
        const sqlFabrics = "SELECT * FROM garment_costing_fabrics WHERE costing_id = ?";
        const sqlTrims = "SELECT * FROM garment_costing_trims WHERE costing_id = ?";
        const sqlProcesses = "SELECT * FROM garment_costing_processes WHERE costing_id = ?";

        db.query(sqlFabrics, [costingId], (err, fabrics) => {
            if (err) return res.status(500).json({ error: err.message });
            db.query(sqlTrims, [costingId], (err, trims) => {
                if (err) return res.status(500).json({ error: err.message });
                db.query(sqlProcesses, [costingId], (err, processes) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({
                        ...costingData[0],
                        fabrics,
                        trims,
                        processes
                    });
                });
            });
        });
    });
});

// Get latest costing by order_planning_id
router.get("/order/:order_planning_id", (req, res) => {
    const { order_planning_id } = req.params;
    const sqlCosting = "SELECT * FROM garment_costing WHERE order_planning_id = ? ORDER BY id DESC LIMIT 1";

    db.query(sqlCosting, [order_planning_id], (err, costingData) => {
        if (err) return res.status(500).json({ error: err.message });
        if (costingData.length === 0) return res.json(null);

        const costingId = costingData[0].id;
        const sqlFabrics = "SELECT * FROM garment_costing_fabrics WHERE costing_id = ?";
        const sqlTrims = "SELECT * FROM garment_costing_trims WHERE costing_id = ?";
        const sqlProcesses = "SELECT * FROM garment_costing_processes WHERE costing_id = ?";

        db.query(sqlFabrics, [costingId], (err, fabrics) => {
            if (err) return res.status(500).json({ error: err.message });
            db.query(sqlTrims, [costingId], (err, trims) => {
                if (err) return res.status(500).json({ error: err.message });
                db.query(sqlProcesses, [costingId], (err, processes) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({
                        ...costingData[0],
                        fabrics,
                        trims,
                        processes
                    });
                });
            });
        });
    });
});

// Save or Update costing
router.post("/", async (req, res) => {
    const {
        id, // Optional, for updates
        order_planning_id,
        buyer_id,
        buyer_name,
        style_no,
        description,
        order_qty,
        currency,
        target_fob,
        delivery_date,
        status,
        version,
        cm_cost,
        overhead_pct,
        profit_pct,
        total_fabrics_cost,
        total_trims_cost,
        total_processing_cost,
        total_cost,
        final_fob,
        fabrics,
        trims,
        processes
    } = req.body;

    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();

        let costingId = id;

        if (id) {
            // Check if it's already approved
            const [existing] = await conn.query("SELECT status FROM garment_costing WHERE id = ?", [id]);
            if (existing.length > 0 && existing[0].status === 'Approved' && status !== 'Approved') {
                return res.status(403).json({ error: "Approved costing cannot be edited" });
            }

            const updateSql = `
                UPDATE garment_costing SET 
                buyer_id = ?, buyer_name = ?, style_no = ?, description = ?, order_qty = ?, 
                currency = ?, target_fob = ?, delivery_date = ?, status = ?, version = ?, cm_cost = ?, overhead_pct = ?, 
                profit_pct = ?, total_fabrics_cost = ?, total_trims_cost = ?, total_processing_cost = ?, 
                total_cost = ?, final_fob = ?
                WHERE id = ?
            `;
            await conn.query(updateSql, [
                buyer_id, buyer_name, style_no, description, order_qty,
                currency, target_fob, delivery_date, status, version, cm_cost, overhead_pct,
                profit_pct, total_fabrics_cost, total_trims_cost, total_processing_cost,
                total_cost, final_fob, id
            ]);

            // Clear related tables
            await conn.query("DELETE FROM garment_costing_fabrics WHERE costing_id = ?", [id]);
            await conn.query("DELETE FROM garment_costing_trims WHERE costing_id = ?", [id]);
            await conn.query("DELETE FROM garment_costing_processes WHERE costing_id = ?", [id]);
        } else {
            const insertSql = `
                INSERT INTO garment_costing 
                (order_planning_id, buyer_id, buyer_name, style_no, description, order_qty, currency, target_fob, delivery_date, status, version, cm_cost, overhead_pct, profit_pct, total_fabrics_cost, total_trims_cost, total_processing_cost, total_cost, final_fob)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const [result] = await conn.query(insertSql, [
                order_planning_id, buyer_id, buyer_name, style_no, description, order_qty, currency, target_fob, delivery_date, status, version, cm_cost, overhead_pct, profit_pct, total_fabrics_cost, total_trims_cost, total_processing_cost, total_cost, final_fob
            ]);
            costingId = result.insertId;
        }

        // Insert fabrics
        if (fabrics && fabrics.length > 0) {
            const fabricValues = fabrics.map(f => [costingId, f.fabric_name, f.gsm, f.cons_kg_pc, f.excess_pct || 0, f.final_cons || 0, f.rate_kg, f.total_cost]);
            await conn.query("INSERT INTO garment_costing_fabrics (costing_id, fabric_name, gsm, cons_kg_pc, excess_pct, final_cons, rate_kg, total_cost) VALUES ?", [fabricValues]);
        }

        // Insert trims
        if (trims && trims.length > 0) {
            const trimValues = trims.map(t => [costingId, t.trim_name, t.uom || 'Pc', t.qty_pc || 0, t.excess_pct || 0, t.final_qty || 0, t.rate || 0, t.total_cost]);
            await conn.query("INSERT INTO garment_costing_trims (costing_id, trim_name, uom, qty_pc, excess_pct, final_qty, rate, total_cost) VALUES ?", [trimValues]);
        }

        // Insert processes (Merging both tables)
        const allProcesses = [
            ...(processes || []).map(p => ({ ...p, type: 'Process' })),
            ...(req.body.additional_processes || []).map(p => ({ ...p, type: 'CMT' }))
        ];

        if (allProcesses.length > 0) {
            const processValues = allProcesses.map(p => [costingId, p.process_name, p.basis, p.rate, p.cost_pc, p.type || 'General']);
            await conn.query("INSERT INTO garment_costing_processes (costing_id, process_name, basis, rate, cost_pc, process_type) VALUES ?", [processValues]);
        }

        await conn.commit();
        res.json({ message: "Costing saved successfully", id: costingId });
    } catch (err) {
        await conn.rollback();
        console.error("Save error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

export default router;
