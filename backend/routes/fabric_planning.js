import express from "express";
import db from "../db.js";

const router = express.Router();

// Save Fabric Planning
router.post("/", async (req, res) => {
    const { order_id, items } = req.body;
    const cleanOrderId = parseInt(order_id);
    if (!cleanOrderId || isNaN(cleanOrderId)) {
        return res.status(400).json({ error: "Invalid Order ID" });
    }
    console.log(`Saving Fabric Planning for Order: ${cleanOrderId}`, items?.length, "items");

    db.getConnection(async (err, conn) => {
        if (err) {
            console.error("DB Connection Error:", err);
            return res.status(500).json({ error: "DB Connection failed" });
        }

        try {
            await conn.promise().beginTransaction();

            const { order_id, items, wastage_pct } = req.body;
            const globalWastage = parseFloat(wastage_pct) || 0;

            // Check if exists
            const [existing] = await conn.promise().query("SELECT id FROM fabric_planning WHERE order_id = ?", [cleanOrderId]);
            let mainId;

            if (existing.length > 0) {
                mainId = existing[0].id;
                await conn.promise().query("UPDATE fabric_planning SET wastage_pct = ? WHERE id = ?", [globalWastage, mainId]);
                // Clear old items
                await conn.promise().query("DELETE FROM fabric_planning_items WHERE fabric_planning_id = ?", [mainId]);
            } else {
                const [mainResult] = await conn.promise().query(
                    "INSERT INTO fabric_planning (order_id, wastage_pct) VALUES (?, ?)",
                    [cleanOrderId, globalWastage]
                );
                mainId = mainResult.insertId;
            }

            if (items && items.length > 0) {
                const itemValues = items.map(item => [
                    mainId,
                    item.style_part || 'Top',
                    item.body_part,
                    item.fabric_name,
                    item.gsm,
                    item.dia,
                    item.color,
                    item.composition,
                    item.counts,
                    JSON.stringify(item.consumption_data || {}),
                    parseFloat(item.avg_wt) || 0,
                    parseFloat(item.total_req) || 0,
                    parseFloat(item.wastage_pct) || 0,
                    item.fabric_type || 'Yarn'
                ]);

                await conn.promise().query(
                    "INSERT INTO fabric_planning_items (fabric_planning_id, style_part, body_part, fabric_name, gsm, dia, color, composition, counts, consumption_data, avg_wt, total_req, wastage_pct, fabric_type) VALUES ?",
                    [itemValues]
                );
            }

            await conn.promise().commit();
            console.log("Fabric Planning saved successfully");
            res.json({ message: "Fabric Planning saved", id: mainId });
        } catch (error) {
            console.error("Fabric Planning Save Error:", error);
            await conn.promise().rollback();
            res.status(500).json({ error: error.message });
        } finally {
            conn.release();
        }
    });
});

// Get by Order ID
router.get("/order/:orderId", (req, res) => {
    const { orderId } = req.params;
    db.query("SELECT * FROM fabric_planning WHERE order_id = ?", [orderId], (err, main) => {
        if (err) return res.status(500).json({ error: err.message });
        if (main.length === 0) {
            return res.status(200).json({
                id: null,
                order_id: orderId,
                wastage_pct: 0,
                items: []
            });
        }

        const id = main[0].id;
        db.query("SELECT * FROM fabric_planning_items WHERE fabric_planning_id = ?", [id], (err, items) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...main[0], items });
        });
    });
});

export default router;
