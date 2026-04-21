import express from "express";
import db from "../db.js";

const router = express.Router();

// 1. Outstanding Report (simplified for now)
router.get("/outstanding", async (req, res) => {
    try {
        const q = "SELECT * FROM outstanding ORDER BY id DESC";
        const [rows] = await db.promise().query(q);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 2. Company Statement
router.get("/company-statement", async (req, res) => {
    const { company_name, fromDate, toDate } = req.query;
    try {
        let q = "SELECT * FROM company_statements WHERE 1=1";
        const params = [];
        if (company_name) { q += " AND company_name = ?"; params.push(company_name); }
        if (fromDate) { q += " AND date >= ?"; params.push(fromDate); }
        if (toDate) { q += " AND date <= ?"; params.push(toDate); }
        q += " ORDER BY date ASC";
        const [rows] = await db.promise().query(q, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 3. Stock Report
router.get("/stock-report", async (req, res) => {
    const { category } = req.query;
    try {
        let q = "SELECT * FROM master_stock WHERE 1=1";
        const params = [];
        if (category) { q += " AND category = ?"; params.push(category); }
        const [rows] = await db.promise().query(q, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 4. DC Reports
router.get("/dc-report", async (req, res) => {
    const { fromDate, toDate } = req.query;
    try {
        let q = "SELECT * FROM dc WHERE 1=1";
        const params = [];
        if (fromDate) { q += " AND dc_date >= ?"; params.push(fromDate); }
        if (toDate) { q += " AND dc_date <= ?"; params.push(toDate); }
        const [rows] = await db.promise().query(q, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 5. Invoice Report
router.get("/invoice-report", async (req, res) => {
    const { fromDate, toDate } = req.query;
    try {
        let q = "SELECT * FROM invoice WHERE 1=1";
        const params = [];
        if (fromDate) { q += " AND invoice_date >= ?"; params.push(fromDate); }
        if (toDate) { q += " AND invoice_date <= ?"; params.push(toDate); }
        const [rows] = await db.promise().query(q, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 6. PO Report
router.get("/po-report", async (req, res) => {
    const { fromDate, toDate } = req.query;
    try {
        let q = "SELECT * FROM product_po WHERE 1=1";
        const params = [];
        if (fromDate) { q += " AND po_date >= ?"; params.push(fromDate); }
        if (toDate) { q += " AND po_date <= ?"; params.push(toDate); }
        const [rows] = await db.promise().query(q, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 7. GRN Report
router.get("/grn-report", async (req, res) => {
    const { fromDate, toDate } = req.query;
    try {
        let q = "SELECT * FROM grn WHERE 1=1";
        const params = [];
        if (fromDate) { q += " AND grn_date >= ?"; params.push(fromDate); }
        if (toDate) { q += " AND grn_date <= ?"; params.push(toDate); }
        const [rows] = await db.promise().query(q, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 8. Purchase Report
router.get("/purchase-report", async (req, res) => {
    const { fromDate, toDate } = req.query;
    try {
        let q = "SELECT * FROM purchase WHERE 1=1";
        const params = [];
        if (fromDate) { q += " AND purchase_date >= ?"; params.push(fromDate); }
        if (toDate) { q += " AND purchase_date <= ?"; params.push(toDate); }
        const [rows] = await db.promise().query(q, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 9. PI Report
router.get("/pi-report", async (req, res) => {
    const { fromDate, toDate } = req.query;
    try {
        let q = "SELECT * FROM pi WHERE 1=1";
        const params = [];
        if (fromDate) { q += " AND pi_date >= ?"; params.push(fromDate); }
        if (toDate) { q += " AND pi_date <= ?"; params.push(toDate); }
        const [rows] = await db.promise().query(q, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 10. Estimate Report
router.get("/estimate-report", async (req, res) => {
    const { fromDate, toDate } = req.query;
    try {
        let q = "SELECT * FROM estimate WHERE 1=1";
        const params = [];
        if (fromDate) { q += " AND estimate_date >= ?"; params.push(fromDate); }
        if (toDate) { q += " AND estimate_date <= ?"; params.push(toDate); }
        const [rows] = await db.promise().query(q, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 11. Quotation Report
router.get("/quotation-report", async (req, res) => {
    const { fromDate, toDate } = req.query;
    try {
        let q = "SELECT * FROM quotation WHERE 1=1";
        const params = [];
        if (fromDate) { q += " AND quotation_date >= ?"; params.push(fromDate); }
        if (toDate) { q += " AND quotation_date <= ?"; params.push(toDate); }
        const [rows] = await db.promise().query(q, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 12. Debit Note Report
router.get("/debitnote-report", async (req, res) => {
    const { fromDate, toDate } = req.query;
    try {
        let q = "SELECT * FROM debit_note WHERE 1=1";
        const params = [];
        if (fromDate) { q += " AND date >= ?"; params.push(fromDate); }
        if (toDate) { q += " AND date <= ?"; params.push(toDate); }
        const [rows] = await db.promise().query(q, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 13. Credit Note Report
router.get("/creditnote-report", async (req, res) => {
    const { fromDate, toDate } = req.query;
    try {
        let q = "SELECT * FROM credit_note WHERE 1=1";
        const params = [];
        if (fromDate) { q += " AND date >= ?"; params.push(fromDate); }
        if (toDate) { q += " AND date <= ?"; params.push(toDate); }
        const [rows] = await db.promise().query(q, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 14. Job Outward vs Invoice Reconciliation Report
router.get("/jobwork-invoice-reconciliation", async (req, res) => {
    try {
        let q = `
            SELECT 
                jo.outward_no, 
                jo.outward_date, 
                jo.party_name, 
                jo.total_qty as outward_qty,
                GROUP_CONCAT(DISTINCT inv.invoice_no) as invoice_nos,
                SUM(COALESCE(inv.total_qty, 0)) as invoiced_qty,
                (jo.total_qty - SUM(COALESCE(inv.total_qty, 0))) as pending_qty
            FROM dc jo
            LEFT JOIN invoice inv ON jo.outward_no = inv.dc_no
            GROUP BY jo.outward_no
            ORDER BY jo.outward_date DESC
        `;
        const [rows] = await db.promise().query(q);
        res.json(rows);
    } catch (err) {
        console.error("Reconciliation Report Error:", err);
        res.status(500).json({ error: "Failed to load reconciliation data" });
    }
});

// 15. Order Status Ledger Report (Transactional)
router.get("/order-status-ledger", async (req, res) => {
    const { order_no, process, fromDate, toDate, fabric, color, dia, groupByFabric, groupByColor, groupByDia } = req.query;
    try {
        let sql = `
            SELECT 
                combined.order_no, 
                combined.order_name, 
                combined.party_name as company_name, 
                combined.process,
                MAX(combined.units) as uom,
                SUM(COALESCE(combined.outward_qty, 0)) as total_outward,
                SUM(COALESCE(combined.inward_qty, 0)) as total_inward,
                SUM(COALESCE(combined.return_qty, 0)) as total_return,
                SUM(COALESCE(combined.inward_weight, 0)) as total_inward_weight,
                (SUM(COALESCE(combined.outward_qty, 0)) - 
                 SUM(CASE WHEN TRIM(LOWER(combined.process)) LIKE '%cutting%' THEN COALESCE(combined.inward_weight, 0) ELSE COALESCE(combined.inward_qty, 0) END) - 
                 SUM(COALESCE(combined.return_qty, 0))) as balance,
                MAX(combined.activity_date) as last_date,
                GROUP_CONCAT(DISTINCT combined.fabric_name) as fabrics,
                GROUP_CONCAT(DISTINCT combined.item_color) as colors,
                GROUP_CONCAT(DISTINCT combined.style_color) as style_colors,
                GROUP_CONCAT(DISTINCT combined.dia) as dias,
                MAX(combined.fabric_name) as single_fabric,
                MAX(combined.item_color) as single_color,
                MAX(combined.style_color) as single_style_color,
                MAX(combined.dia) as single_dia,
                MAX(COALESCE(lc.sequence_no, mlc.sort_order, 999)) as sort_order
            FROM (
                -- 1. Yarn Dyeing / Knitting (Yarn/Fabric flow)
                SELECT h.order_no, h.order_name, h.party_name, h.process, i.qty as outward_qty, 0 as inward_qty, 0 as return_qty, 0 as inward_weight, 'KG' as units, h.outward_date as activity_date,
                       COALESCE(NULLIF(i.fabric_name, ''), i.yarn_name) as fabric_name, i.color as item_color, NULL as style_color, i.dia FROM yarn_dyeing_outward h JOIN yarn_dyeing_outward_items i ON h.id = i.outward_id
                UNION ALL
                SELECT h.order_no, h.order_name, h.party_name, h.process, 0 as outward_qty, i.qty as inward_qty, 0 as return_qty, 0 as inward_weight, 'KG' as units, h.inward_date as activity_date,
                       COALESCE(NULLIF(i.fabric_name, ''), i.yarn_name) as fabric_name, i.color as item_color, NULL as style_color, i.dia FROM yarn_dyeing_inward h JOIN yarn_dyeing_inward_items i ON h.id = i.inward_id
                UNION ALL
                SELECT h.order_no, h.order_name, h.party_name, h.process, 0 as outward_qty, 0 as inward_qty, i.qty as return_qty, 0 as inward_weight, 'KG' as units, h.return_date as activity_date,
                       COALESCE(NULLIF(i.fabric_name, ''), i.yarn_name) as fabric_name, i.color as item_color, NULL as style_color, i.dia FROM yarn_dyeing_return h JOIN yarn_dyeing_return_items i ON h.id = i.return_id
                
                UNION ALL
                -- 2. Cutting / Fabric to PCS (Fabric outward, Pieces inward)
                SELECT h.order_no, h.order_name, h.party_name, h.process, i.qty as outward_qty, 0 as inward_qty, 0 as return_qty, 0 as inward_weight, 'KG' as units, h.outward_date as activity_date,
                       i.fabric_name, i.color as item_color, NULL as style_color, i.dia FROM fabric_to_pcs_outward h JOIN fabric_to_pcs_outward_items i ON h.id = i.outward_id
                UNION ALL
                SELECT h.order_no, h.order_name, h.party_name, h.process, 0 as outward_qty, i.qty as inward_qty, 0 as return_qty, i.cut_pcs_wt as inward_weight, 
                       CASE WHEN TRIM(LOWER(h.process)) LIKE '%cutting%' THEN 'PCS' ELSE 'KG' END as units, h.inward_date as activity_date,
                       i.fabric_name, COALESCE(NULLIF(i.fabric_color, ''), i.color) as item_color, i.style_color, i.dia FROM fabric_to_pcs_inward h JOIN fabric_to_pcs_inward_items i ON h.id = i.inward_id
                UNION ALL
                SELECT h.order_no, h.order_name, h.party_name, h.process, 0 as outward_qty, 0 as inward_qty, i.qty as return_qty, 0 as inward_weight, 'KG' as units, h.return_date as activity_date,
                       i.fabric_name, i.color as item_color, NULL as style_color, i.dia FROM fabric_to_pcs_return h JOIN fabric_to_pcs_return_items i ON h.id = i.return_id

                UNION ALL
                -- 3. Stitching / Packing / Other Pcs stages
                SELECT h.order_no, h.order_name, h.party_name, h.process, i.pcs as outward_qty, 0 as inward_qty, 0 as return_qty, 0 as inward_weight, 'PCS' as units, h.outward_date as activity_date,
                       COALESCE(NULLIF(i.item_name, ''), i.style_name) as fabric_name, i.color as item_color, i.style_color, NULL as dia FROM pcs_outward h JOIN pcs_outward_items i ON h.id = i.outward_id
                UNION ALL
                SELECT h.order_no, h.order_name, h.party_name, h.process, 0 as outward_qty, i.pcs as inward_qty, 0 as return_qty, 0 as inward_weight, 'PCS' as units, h.inward_date as activity_date,
                       COALESCE(NULLIF(i.item_name, ''), i.style_name) as fabric_name, i.color as item_color, i.style_color, NULL as dia FROM pcs_inward h JOIN pcs_inward_items i ON h.id = i.inward_id
                UNION ALL
                SELECT h.order_no, h.order_name, h.party_name, h.process, 0 as outward_qty, 0 as inward_qty, i.pcs as return_qty, 0 as inward_weight, 'PCS' as units, h.return_date as activity_date,
                       COALESCE(NULLIF(i.item_name, ''), i.style_name) as fabric_name, i.color as item_color, i.style_color, NULL as dia FROM pcs_return h JOIN pcs_return_items i ON h.id = i.return_id
            ) AS combined
            LEFT JOIN order_planning op ON combined.order_no = op.order_no
            LEFT JOIN order_lifecycle lc ON op.id = lc.order_id AND TRIM(LOWER(combined.process)) = TRIM(LOWER(lc.process_name))
            LEFT JOIN life_cycles mlc ON TRIM(LOWER(combined.process)) = TRIM(LOWER(mlc.process_name))
            WHERE 1=1
        `;

        const params = [];
        if (order_no && order_no.trim() !== "") { sql += " AND combined.order_no = ?"; params.push(order_no); }
        if (process && process.trim() !== "") { sql += " AND combined.process = ?"; params.push(process); }
        if (fromDate && fromDate.trim() !== "") { sql += " AND combined.activity_date >= ?"; params.push(fromDate); }
        if (toDate && toDate.trim() !== "") { sql += " AND combined.activity_date <= ?"; params.push(toDate); }

        if (fabric) { sql += " AND combined.fabric_name LIKE ?"; params.push(`%${fabric}%`); }
        if (color) { sql += " AND (combined.item_color LIKE ? OR combined.style_color LIKE ?)"; params.push(`%${color}%`, `%${color}%`); }
        if (dia) { sql += " AND combined.dia LIKE ?"; params.push(`%${dia}%`); }

        sql += " GROUP BY combined.order_no, combined.order_name, combined.party_name, combined.process";

        if (groupByFabric === 'true') sql += ", combined.fabric_name";
        if (groupByColor === 'true') sql += ", combined.item_color, combined.style_color";
        if (groupByDia === 'true') sql += ", combined.dia";

        sql += " ORDER BY sort_order ASC, last_date DESC, combined.process";

        const [rows] = await db.promise().query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Order Status Ledger API Error:", err);
        res.status(500).json({
            error: "Failed to load ledger data",
            message: err.message
        });
    }
});

// 16. Order Detailed Report - Full compilation for a single order
router.get("/order-details/:orderNo", async (req, res) => {
    const { orderNo } = req.params;
    try {
        // 1. Get Core Order Info
        const [orderRows] = await db.promise().query(
            "SELECT * FROM order_planning WHERE order_no = ? LIMIT 1",
            [orderNo]
        );
        if (!orderRows.length) return res.status(404).json({ error: "Order not found" });
        const order = orderRows[0];

        // Helper for fetching with items
        const fetchTransaction = async (hTable, iTable, idCol) => {
            try {
                // Fetch headers
                const [headers] = await db.promise().query(`SELECT * FROM ${hTable} WHERE order_no = ? ORDER BY id DESC`, [orderNo]);

                for (let h of headers) {
                    // Fetch items
                    const [items] = await db.promise().query(`SELECT * FROM ${iTable} WHERE ${idCol} = ?`, [h.id]);
                    h.items = items;

                    // Calculate total_qty if not already provided by the table
                    if (!h.total_qty || parseFloat(h.total_qty) === 0) {
                        h.total_qty = items.reduce((sum, it) => sum + parseFloat(it.qty || it.pcs || 0), 0);
                    }
                }
                return headers;
            } catch (queryErr) {
                console.warn(`Table ${hTable} or ${iTable} error:`, queryErr.message);
                return [];
            }
        };

        const [
            fabricRows, yarnRows, trimsRows, lifecycleRows,
            yarnPoRows, fabricPoRows, trimsPoRows, garmentsPoRows, generalPoRows,
            yarnGrnRows, fabricGrnRows, trimsGrnRows, garmentsGrnRows,
            ydOut, ydIn, ydRet,
            f2pOut, f2pIn, f2pRet,
            pcsOut, pcsIn, pcsRet
        ] = await Promise.all([
            db.promise().query("SELECT fp.wastage_pct as global_wastage, fpi.* FROM fabric_planning fp JOIN fabric_planning_items fpi ON fp.id = fpi.fabric_planning_id WHERE fp.order_id = ?", [order.id]),
            db.promise().query("SELECT * FROM yarn_planning WHERE order_id = ?", [order.id]),
            db.promise().query("SELECT * FROM trims_planning WHERE order_id = ?", [order.id]),
            db.promise().query("SELECT * FROM order_lifecycle WHERE order_id = ? ORDER BY sequence_no ASC", [order.id]),

            // POs
            fetchTransaction('yarn_po', 'yarn_po_items', 'po_id'),
            fetchTransaction('fabric_po', 'fabric_po_items', 'po_id'),
            fetchTransaction('trims_po', 'trims_po_items', 'po_id'),
            fetchTransaction('garments_po', 'garments_po_items', 'po_id'),
            fetchTransaction('general_po', 'general_po_items', 'po_id'),

            // GRNs (general_grn excluded as it lacks order_no)
            fetchTransaction('yarn_grn', 'yarn_grn_items', 'grn_id'),
            fetchTransaction('fabric_grn', 'fabric_grn_items', 'grn_id'),
            fetchTransaction('trims_grn', 'trims_grn_items', 'grn_id'),
            fetchTransaction('garments_grn', 'garments_grn_items', 'grn_id'),

            // Jobwork History
            fetchTransaction('yarn_dyeing_outward', 'yarn_dyeing_outward_items', 'outward_id'),
            fetchTransaction('yarn_dyeing_inward', 'yarn_dyeing_inward_items', 'inward_id'),
            fetchTransaction('yarn_dyeing_return', 'yarn_dyeing_return_items', 'return_id'),

            fetchTransaction('fabric_to_pcs_outward', 'fabric_to_pcs_outward_items', 'outward_id'),
            fetchTransaction('fabric_to_pcs_inward', 'fabric_to_pcs_inward_items', 'inward_id'),
            fetchTransaction('fabric_to_pcs_return', 'fabric_to_pcs_return_items', 'return_id'),

            fetchTransaction('pcs_outward', 'pcs_outward_items', 'outward_id'),
            fetchTransaction('pcs_inward', 'pcs_inward_items', 'inward_id'),
            fetchTransaction('pcs_return', 'pcs_return_items', 'return_id'),
        ]);

        res.json({
            order,
            fabrics: fabricRows[0],
            yarn: yarnRows[0],
            trims: trimsRows[0],
            lifecycle: lifecycleRows[0],
            pos: {
                yarn: yarnPoRows,
                fabric: fabricPoRows,
                trims: trimsPoRows,
                garments: garmentsPoRows,
                general: generalPoRows
            },
            grns: {
                yarn: yarnGrnRows,
                fabric: fabricGrnRows,
                trims: trimsGrnRows,
                garments: garmentsGrnRows,
                general: [] // Excluded from order-specific reports
            },
            jobwork: {
                yarn_to_fabric: { outward: ydOut, inward: ydIn, return: ydRet },
                fabric_to_pcs: { outward: f2pOut, inward: f2pIn, return: f2pRet },
                pcs: { outward: pcsOut, inward: pcsIn, return: pcsRet }
            }
        });
    } catch (err) {
        console.error("Order Details API Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 17. PCS Only WIP Report
router.get("/pcs-wip-report", async (req, res) => {
    const { order_no, fromDate, toDate } = req.query;
    try {
        let sql = `
            SELECT 
                combined.order_no, 
                combined.order_name, 
                combined.contractor_name, 
                combined.process,
                SUM(COALESCE(combined.outward_qty, 0)) as total_outward,
                SUM(COALESCE(combined.inward_qty, 0)) as total_inward,
                SUM(COALESCE(combined.return_qty, 0)) as total_return,
                (SUM(COALESCE(combined.outward_qty, 0)) - 
                 SUM(COALESCE(combined.inward_qty, 0)) - 
                 SUM(COALESCE(combined.return_qty, 0))) as balance,
                MAX(combined.activity_date) as last_activity
            FROM (
                SELECT h.order_no, h.order_name, COALESCE(NULLIF(h.contractor_name, ''), h.party_name) as contractor_name, h.process, i.pcs as outward_qty, 0 as inward_qty, 0 as return_qty, h.outward_date as activity_date
                FROM pcs_outward h JOIN pcs_outward_items i ON h.id = i.outward_id
                UNION ALL
                SELECT h.order_no, h.order_name, COALESCE(NULLIF(h.contractor_name, ''), h.party_name) as contractor_name, h.process, 0 as outward_qty, i.pcs as inward_qty, 0 as return_qty, h.inward_date as activity_date
                FROM pcs_inward h JOIN pcs_inward_items i ON h.id = i.inward_id
                UNION ALL
                SELECT h.order_no, h.order_name, COALESCE(NULLIF(h.contractor_name, ''), h.party_name) as contractor_name, h.process, 0 as outward_qty, 0 as inward_qty, i.pcs as return_qty, h.return_date as activity_date
                FROM pcs_return h JOIN pcs_return_items i ON h.id = i.return_id
            ) AS combined
            WHERE 1=1
        `;

        const params = [];
        if (order_no) { sql += " AND combined.order_no = ?"; params.push(order_no); }
        if (fromDate) { sql += " AND combined.activity_date >= ?"; params.push(fromDate); }
        if (toDate) { sql += " AND combined.activity_date <= ?"; params.push(toDate); }

        sql += " GROUP BY combined.order_no, combined.order_name, combined.contractor_name, combined.process";
        sql += " ORDER BY last_activity DESC";

        const [rows] = await db.promise().query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("PCS WIP API Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 18. Order Sheet Report - Specific production details
router.get("/order-sheet/:orderNo", async (req, res) => {
    const { orderNo } = req.params;
    try {
        // 1. Get Company Info
        const [companyResult] = await db.promise().query("SELECT * FROM company_profile LIMIT 1");
        const company = companyResult[0] || {};

        // 2. Get Core Order Info
        const [orderRows] = await db.promise().query(
            "SELECT * FROM order_planning WHERE order_no = ? LIMIT 1",
            [orderNo]
        );
        if (!orderRows.length) return res.status(404).json({ error: "Order not found" });
        const order = orderRows[0];

        // 3. Get Size Quantity Details
        const [sqRows] = await db.promise().query("SELECT * FROM size_quantity WHERE order_id = ? LIMIT 1", [order.id]);
        let qty = { total_qty: 0, excess_pct: 0 };
        let items = [];

        if (sqRows.length > 0) {
            qty = { total_qty: sqRows[0].total_qty, excess_pct: sqRows[0].excess_pct };
            const [itemRows] = await db.promise().query("SELECT * FROM size_quantity_items WHERE size_quantity_id = ?", [sqRows[0].id]);
            items = itemRows;
        }

        // 4. Get Fabrics
        const [fabRows] = await db.promise().query("SELECT DISTINCT fabric_name FROM fabric_planning_items WHERE fabric_planning_id IN (SELECT id FROM fabric_planning WHERE order_id = ?)", [order.id]);
        const fabrics = fabRows.map(f => f.fabric_name);

        res.json({
            company,
            order,
            qty,
            items,
            fabrics
        });
    } catch (err) {
        console.error("Order Sheet API Error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
