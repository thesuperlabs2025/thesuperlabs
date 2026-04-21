import express from "express";
import db from "../db.js";

const router = express.Router();

// Get fabrics assigned to a yarn (by yarn_sku or yarn_name) for an order - for Knitting fabric dropdown
router.get("/fabrics-for-yarn", async (req, res) => {
    const order_no = (req.query.order_no || "").trim();
    const yarn_sku = (req.query.yarn_sku || "").trim();
    const yarn_name = (req.query.yarn_name || "").trim();
    if (!order_no) return res.status(400).json({ error: "order_no is required" });
    try {
        const [orders] = await db.promise().query("SELECT id FROM order_planning WHERE order_no = ? LIMIT 1", [order_no]);
        if (!orders.length) return res.json({ fabrics: [] });
        const order_id = orders[0].id;
        let fabrics = [];
        if (yarn_sku) {
            const [rows] = await db.promise().query(
                `SELECT DISTINCT yp.fabric_name FROM yarn_planning yp
                 WHERE yp.order_id = ?
                   AND (yp.yarn_name = (SELECT yarn_name FROM yarn WHERE yarn_sku = ? LIMIT 1))`,
                [order_id, yarn_sku]
            );
            fabrics = (rows || []).map(r => r.fabric_name).filter(Boolean);
        }
        if (fabrics.length === 0 && yarn_name) {
            const [rows] = await db.promise().query(
                "SELECT DISTINCT fabric_name FROM yarn_planning WHERE order_id = ? AND yarn_name = ?",
                [order_id, yarn_name]
            );
            fabrics = (rows || []).map(r => r.fabric_name).filter(Boolean);
        }
        res.json({ fabrics });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get GSM and DIA options for a fabric in an order (for Knitting outward GSM/DIA dropdowns)
router.get("/fabric-gsm-dia", async (req, res) => {
    const order_no = (req.query.order_no || "").trim();
    const fabric_name = (req.query.fabric_name || "").trim();
    if (!order_no || !fabric_name) return res.status(400).json({ error: "order_no and fabric_name are required" });
    try {
        const [orders] = await db.promise().query("SELECT id FROM order_planning WHERE order_no = ? LIMIT 1", [order_no]);
        if (!orders.length) return res.json({ gsm_list: [], dia_list: [] });
        const order_id = orders[0].id;
        const [fp] = await db.promise().query("SELECT id FROM fabric_planning WHERE order_id = ? LIMIT 1", [order_id]);
        if (!fp.length) return res.json({ gsm_list: [], dia_list: [] });
        const [items] = await db.promise().query(
            "SELECT DISTINCT gsm, dia FROM fabric_planning_items WHERE fabric_planning_id = ? AND (fabric_name = ? OR fabric_name LIKE ?)",
            [fp[0].id, fabric_name, fabric_name + "%"]
        );
        const gsm_list = [...new Set((items || []).map(r => r.gsm).filter(Boolean))].sort();
        const dia_list = [...new Set((items || []).map(r => r.dia).filter(Boolean))].sort();
        res.json({ gsm_list, dia_list });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Data for Order (Multi-endpoint or single)
router.get("/all/:orderId", async (req, res) => {
    const { orderId } = req.params;
    try {
        const [planningRows] = await db.promise().query("SELECT * FROM order_planning WHERE id = ?", [orderId]);
        const planning = planningRows.length > 0 ? planningRows[0] : {};

        const [yarn] = await db.promise().query("SELECT * FROM yarn_planning WHERE order_id = ?", [orderId]);
        const [trims] = await db.promise().query("SELECT * FROM trims_planning WHERE order_id = ?", [orderId]);
        const [bom] = await db.promise().query("SELECT * FROM order_bom WHERE order_id = ?", [orderId]);
        const [lifecycle] = await db.promise().query("SELECT * FROM order_lifecycle WHERE order_id = ? ORDER BY sequence_no ASC, id ASC", [orderId]);
        const [trims_lifecycle] = await db.promise().query("SELECT * FROM order_trims_lifecycle WHERE order_id = ?", [orderId]);

        res.json({ planning, yarn, trims, bom, lifecycle, trims_lifecycle });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Yarn Planning
router.post("/yarn", async (req, res) => {
    const { order_id, items } = req.body;
    const cleanOrderId = parseInt(order_id);
    if (!cleanOrderId || isNaN(cleanOrderId)) return res.status(400).json({ error: "Invalid Order ID" });
    console.log(`Saving Yarn for Order: ${cleanOrderId}`, items?.length, "items");
    try {
        await db.promise().query("DELETE FROM yarn_planning WHERE order_id = ?", [cleanOrderId]);
        if (items?.length > 0) {
            const vals = items.map(i => [
                cleanOrderId,
                i.fabric_id_ref,
                i.fabric_name,
                i.yarn_name,
                i.yarn_counts,
                i.yarn_color,
                parseFloat(i.consumption) || 0,
                parseFloat(i.wastage_pct) || 0
            ]);
            await db.promise().query("INSERT INTO yarn_planning (order_id, fabric_id_ref, fabric_name, yarn_name, yarn_counts, yarn_color, consumption, wastage_pct) VALUES ?", [vals]);
        }
        res.json({ message: "Yarn planning saved" });
    } catch (err) {
        console.error("Yarn Save Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Trims Planning
router.post("/trims", async (req, res) => {
    const { order_id, items } = req.body;
    const cleanOrderId = parseInt(order_id);
    if (!cleanOrderId || isNaN(cleanOrderId)) return res.status(400).json({ error: "Invalid Order ID" });
    console.log(`Saving Trims for Order: ${cleanOrderId}`, items?.length, "items");

    try {
        await db.promise().query("DELETE FROM trims_planning WHERE order_id = ?", [cleanOrderId]);
        if (items?.length > 0) {
            const vals = items.map(i => [
                cleanOrderId,
                i.style_part || 'Top',
                i.trims_name,
                i.color,
                i.trim_type,
                parseFloat(i.qty_per_pcs) || 0,
                JSON.stringify(i.consumption_data || {})
            ]);
            console.log("Insert values sample:", JSON.stringify(vals[0]));
            await db.promise().query("INSERT INTO trims_planning (order_id, style_part, trims_name, color, trim_type, qty_per_pcs, consumption_data) VALUES ?", [vals]);
        }
        res.json({ message: "Trims planning saved" });
    } catch (err) {
        console.error("Trims Save Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// BOM
router.post("/bom", async (req, res) => {
    const { order_id, items } = req.body;
    const cleanOrderId = parseInt(order_id);
    if (!cleanOrderId || isNaN(cleanOrderId)) return res.status(400).json({ error: "Invalid Order ID" });
    try {
        await db.promise().query("DELETE FROM order_bom WHERE order_id = ?", [cleanOrderId]);
        if (items?.length > 0) {
            const vals = items.map(i => [
                cleanOrderId,
                i.item_category,
                i.item_name,
                parseFloat(i.required_qty) || 0,
                parseFloat(i.final_qty) || 0,
                i.export_to_po ? 1 : 0,
                parseFloat(i.budget_rate) || 0
            ]);
            await db.promise().query("INSERT INTO order_bom (order_id, item_category, item_name, required_qty, final_qty, export_to_po, budget_rate) VALUES ?", [vals]);
        }
        res.json({ message: "BOM saved" });
    } catch (err) {
        console.error("BOM Save Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Lifecycle
router.post("/lifecycle", async (req, res) => {
    const { order_id, items, fabric_in_house_process } = req.body;
    const cleanOrderId = parseInt(order_id);
    if (!cleanOrderId || isNaN(cleanOrderId)) return res.status(400).json({ error: "Invalid Order ID" });
    try {
        await db.promise().query("DELETE FROM order_lifecycle WHERE order_id = ?", [cleanOrderId]);
        if (items?.length > 0) {
            const vals = items.map((i, idx) => [
                cleanOrderId,
                idx + 1,
                i.process_name,
                i.process_type || null,
                i.custom_name || null,
                parseFloat(i.wastage_pct) || 0
            ]);
            await db.promise().query(
                "INSERT INTO order_lifecycle (order_id, sequence_no, process_name, process_type, custom_name, wastage_pct) VALUES ?",
                [vals]
            );
        }

        // Update fabric_in_house_process in order_planning
        await db.promise().query(
            "UPDATE order_planning SET fabric_in_house_process = ? WHERE id = ?",
            [fabric_in_house_process || null, cleanOrderId]
        );

        res.json({ message: "Life Cycle saved" });
    } catch (err) {
        console.error("Lifecycle Save Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Trims Lifecycle
router.post("/trims-lifecycle", async (req, res) => {
    const { order_id, items } = req.body;
    const cleanOrderId = parseInt(order_id);
    try {
        await db.promise().query("DELETE FROM order_trims_lifecycle WHERE order_id = ?", [cleanOrderId]);
        if (items?.length > 0) {
            const vals = items.map(i => [
                cleanOrderId,
                i.trim_name,
                i.process_name,
                parseFloat(i.wastage_pct) || 0
            ]);
            await db.promise().query(
                "INSERT INTO order_trims_lifecycle (order_id, trim_name, process_name, wastage_pct) VALUES ?",
                [vals]
            );
        }
        res.json({ message: "Trims Life Cycle saved" });
    } catch (err) {
        console.error("Trims Lifecycle Save Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Enhanced BOM with PO tracking and Costing rates
router.get("/bom-enhanced/:orderId", async (req, res) => {
    const { orderId } = req.params;
    try {
        // 1. Get planning data
        const [yarnPlan] = await db.promise().query("SELECT * FROM yarn_planning WHERE order_id = ?", [orderId]);
        const [trimsPlan] = await db.promise().query("SELECT * FROM trims_planning WHERE order_id = ?", [orderId]);
        const [mainFabric] = await db.promise().query("SELECT * FROM fabric_planning WHERE order_id = ?", [orderId]);
        let fabricPlan = { items: [], wastage_pct: 0 };
        if (mainFabric.length > 0) {
            const [items] = await db.promise().query("SELECT * FROM fabric_planning_items WHERE fabric_planning_id = ?", [mainFabric[0].id]);
            fabricPlan = { ...mainFabric[0], items };
        }
        const [bom] = await db.promise().query("SELECT * FROM order_bom WHERE order_id = ?", [orderId]);

        // 2. Get latest approved costing for budget rates
        const [costing] = await db.promise().query(
            "SELECT id FROM garment_costing WHERE order_planning_id = ? AND status = 'Approved' ORDER BY id DESC LIMIT 1",
            [orderId]
        );

        let fabricRates = [];
        let trimsRates = [];
        if (costing.length > 0) {
            [fabricRates] = await db.promise().query("SELECT fabric_name, gsm, rate_kg FROM garment_costing_fabrics WHERE costing_id = ?", [costing[0].id]);
            [trimsRates] = await db.promise().query("SELECT trim_name, rate FROM garment_costing_trims WHERE costing_id = ?", [costing[0].id]);
        }

        // 3. Get PO quantities issued
        const [yarnPOs] = await db.promise().query(
            "SELECT ypi.yarn_name, ypi.counts, ypi.color, SUM(ypi.qty) as issued_qty FROM yarn_po_items ypi JOIN yarn_po yp ON ypi.po_id = yp.id WHERE yp.order_id = ? GROUP BY ypi.yarn_name, ypi.counts, ypi.color",
            [orderId]
        );
        const [fabricPOs] = await db.promise().query(
            "SELECT fpi.fabric_name, fpi.counts, fpi.color, fpi.gsm, fpi.dia, SUM(fpi.qty) as issued_qty FROM fabric_po_items fpi JOIN fabric_po fp ON fpi.po_id = fp.id WHERE fp.order_id = ? GROUP BY fpi.fabric_name, fpi.counts, fpi.color, fpi.gsm, fpi.dia",
            [orderId]
        );
        const [trimsPOs] = await db.promise().query(
            "SELECT tpi.trims_name, tpi.color, tpi.size, SUM(tpi.qty) as issued_qty FROM trims_po_items tpi JOIN trims_po tp ON tpi.po_id = tp.id WHERE tp.order_id = ? GROUP BY tpi.trims_name, tpi.color, tpi.size",
            [orderId]
        );

        res.json({
            yarnPlan,
            trimsPlan,
            fabricPlan,
            bom,
            budgetRates: { fabrics: fabricRates, trims: trimsRates },
            issuedPOs: { yarn: yarnPOs, fabric: fabricPOs, trims: trimsPOs }
        });
    } catch (err) {
        console.error("BOM Enhanced Error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
