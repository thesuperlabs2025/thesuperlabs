import express from "express";
import db from "../db.js";

const router = express.Router();

// ─── Auto-create table if not exists ─────────────────────────────────────────
db.query(`CREATE TABLE IF NOT EXISTS fabric_to_pcs_inward (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inward_no VARCHAR(30) NOT NULL,
    inward_type ENUM('order','lot','internal') NOT NULL,
    inward_date DATE,
    ref_no VARCHAR(100),
    order_no VARCHAR(100), order_name VARCHAR(200),
    lot_no VARCHAR(100), lot_name VARCHAR(200),
    internal_lot_no VARCHAR(100), internal_lot_name VARCHAR(200),
    party_name VARCHAR(200),
    ship_to VARCHAR(200),
    work_type VARCHAR(20) DEFAULT 'Jobwork',
    contractor_name VARCHAR(200),
    process VARCHAR(100) DEFAULT 'Fabric to Pcs',
    size_chart_name VARCHAR(100),
    remarks TEXT,
    staff_name VARCHAR(200),
    staff_remarks TEXT,
    total_qty DECIMAL(12,3) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, () => {
    // Ensure ship_to exists for older tables
    db.query("ALTER TABLE fabric_to_pcs_inward ADD COLUMN ship_to VARCHAR(200) AFTER party_name", () => { });
    db.query("ALTER TABLE fabric_to_pcs_inward ADD COLUMN size_chart_name VARCHAR(100) AFTER process", () => { });
    db.query("ALTER TABLE fabric_to_pcs_inward ADD COLUMN work_type VARCHAR(20) DEFAULT 'Jobwork' AFTER ship_to", () => { });
    db.query("ALTER TABLE fabric_to_pcs_inward ADD COLUMN contractor_name VARCHAR(200) AFTER work_type", () => { });
});


db.query(`CREATE TABLE IF NOT EXISTS fabric_to_pcs_inward_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inward_id INT NOT NULL,
    counts VARCHAR(100),
    fabric_name VARCHAR(255),
    gsm VARCHAR(50),
    dia VARCHAR(50),
    color VARCHAR(100),
    qty DECIMAL(12,3) DEFAULT 0,
    FOREIGN KEY (inward_id) REFERENCES fabric_to_pcs_inward(id) ON DELETE CASCADE
)`, () => {
    db.query("ALTER TABLE fabric_to_pcs_inward_items ADD COLUMN fabric_sku VARCHAR(100) AFTER inward_id", () => { });
    db.query("ALTER TABLE fabric_to_pcs_inward_items ADD COLUMN counts VARCHAR(100) AFTER inward_id", () => { });
    db.query("ALTER TABLE fabric_to_pcs_inward_items ADD COLUMN style_name VARCHAR(200) AFTER fabric_name", () => { });
    db.query("ALTER TABLE fabric_to_pcs_inward_items ADD COLUMN gsm VARCHAR(50) AFTER style_name", () => { });
    db.query("ALTER TABLE fabric_to_pcs_inward_items ADD COLUMN dia VARCHAR(50) AFTER gsm", () => { });
    db.query("ALTER TABLE fabric_to_pcs_inward_items ADD COLUMN sizes_data JSON AFTER qty", () => { });
    db.query("ALTER TABLE fabric_to_pcs_inward_items ADD COLUMN fabric_color VARCHAR(100) AFTER color", () => { });
    db.query("ALTER TABLE fabric_to_pcs_inward_items ADD COLUMN style_color VARCHAR(100) AFTER fabric_color", () => { });
    db.query("ALTER TABLE fabric_to_pcs_inward_items ADD COLUMN cut_pcs_wt DECIMAL(12,3) DEFAULT 0 AFTER sizes_data", () => { });
    db.query("ALTER TABLE fabric_to_pcs_inward_items ADD COLUMN waste_pcs_wt DECIMAL(12,3) DEFAULT 0 AFTER cut_pcs_wt", () => { });
    db.query("ALTER TABLE fabric_to_pcs_inward_items ADD COLUMN contractor_name VARCHAR(200) AFTER style_color", () => { });
});


// ─── Helper: next inward number ────────────────────────────────────────────
function nextInwardNo(type, yearId, cb) {
    db.query(
        "SELECT inward_no FROM fabric_to_pcs_inward WHERE inward_type = ? AND year_id = ? ORDER BY id DESC LIMIT 1",
        [type, yearId],
        (err, rows) => {
            if (err || !rows.length) return cb(null, "0001");
            const last = rows[0].inward_no || "";
            const num = parseInt(last.split("-").pop(), 10) || 0;
            const next = String(num + 1).padStart(4, "0");
            cb(null, next);
        }
    );
}

// ─── GET next inward number ─────────────────────────────────────────────────
router.get("/next-no/:type", (req, res) => {
    const yearId = req.headers['x-year-id'];
    nextInwardNo(req.params.type, yearId, (err, no) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ inward_no: no });
    });
});

// ─── GET all records with filters ────────────────────────────────────────────
router.get("/", (req, res) => {
    const { type, from_date, to_date, search } = req.query;
    const yearId = req.headers['x-year-id'];
    let conditions = ["year_id = ?"];
    let params = [yearId];

    if (type) { conditions.push("inward_type = ?"); params.push(type); }
    if (from_date) { conditions.push("DATE(inward_date) >= ?"); params.push(from_date); }
    if (to_date) { conditions.push("DATE(inward_date) <= ?"); params.push(to_date); }
    if (search) {
        const s = `%${search}%`;
        conditions.push("(inward_no LIKE ? OR order_no LIKE ? OR lot_no LIKE ? OR internal_lot_no LIKE ? OR party_name LIKE ? OR ref_no LIKE ?)");
        params.push(s, s, s, s, s, s);
    }

    const where = conditions.length ? " WHERE " + conditions.join(" AND ") : "";
    const q = `SELECT * FROM fabric_to_pcs_inward${where} ORDER BY id DESC`;
    db.query(q, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.get("/order-process-items", async (req, res) => {
    const { order_no, process } = req.query;
    if (!order_no) return res.status(400).json({ error: "Order number is required" });

    const yearId = req.headers['x-year-id'];
    try {
        const inItemsSql = `SELECT i.*, h.party_name, h.ship_to, h.process, h.size_chart_name 
                           FROM fabric_to_pcs_inward_items i
                           JOIN fabric_to_pcs_inward h ON i.inward_id = h.id
                           WHERE h.order_no = ? AND h.year_id = ? ${process ? "AND h.process = ?" : ""}`;

        const retItemsSql = `SELECT i.*, h.process FROM fabric_to_pcs_return_items i 
                            JOIN fabric_to_pcs_return h ON i.return_id = h.id 
                            WHERE h.order_no = ? AND h.year_id = ?`;

        const outItemsSql = `SELECT i.*, h.previous_process FROM fabric_to_pcs_outward_items i
                            JOIN fabric_to_pcs_outward h ON i.outward_id = h.id
                            WHERE h.order_no = ? AND h.year_id = ?`;

        const inParams = process ? [order_no, yearId, process] : [order_no, yearId];
        const [inRows] = await db.promise().query(inItemsSql, inParams);
        const [retRows] = await db.promise().query(retItemsSql, [order_no, yearId]);
        const [outRows] = await db.promise().query(outItemsSql, [order_no, yearId]);

        // Map consumption quantities for subtraction
        const consumedMap = {}; // key: source_process-fabric-color-gsm-dia-counts

        // 1. Add returns to consumption (returns belong to the same process as inward)
        retRows.forEach(it => {
            const fabric = (it.fabric_name || "").trim().toLowerCase();
            const color = (it.color || "").trim().toLowerCase();
            const style = (it.style_name || "").trim().toLowerCase();
            const styleClr = (it.style_color || "").trim().toLowerCase();
            const gsm = (it.gsm || "").trim().toLowerCase();
            const dia = (it.dia || "").trim().toLowerCase();
            const counts = (it.counts || "").trim().toLowerCase();
            const proc = (it.process || "").trim().toLowerCase();
            // Expanded key to include style-wise tracking
            const key = `${proc}-${style}-${styleClr}-${fabric}-${color}-${gsm}-${dia}-${counts}`;
            consumedMap[key] = (consumedMap[key] || 0) + (parseFloat(it.qty) || 0);
        });

        // 2. Add outwards to consumption (outwards consume their previous_process)
        outRows.forEach(it => {
            if (!it.previous_process) return;
            const fabric = (it.fabric_name || "").trim().toLowerCase();
            const color = (it.color || "").trim().toLowerCase();
            const style = (it.style_name || "").trim().toLowerCase();
            const styleClr = (it.style_color || "").trim().toLowerCase();
            const gsm = (it.gsm || "").trim().toLowerCase();
            const dia = (it.dia || "").trim().toLowerCase();
            const counts = (it.counts || "").trim().toLowerCase();
            const prevProc = (it.previous_process || "").trim().toLowerCase();
            const key = `${prevProc}-${style}-${styleClr}-${fabric}-${color}-${gsm}-${dia}-${counts}`;
            consumedMap[key] = (consumedMap[key] || 0) + (parseFloat(it.qty) || 0);
        });

        // Calculate balance for inward rows
        const balancedRows = inRows.map(it => {
            const fabric = (it.fabric_name || "").trim().toLowerCase();
            const color = (it.color || "").trim().toLowerCase();
            const style = (it.style_name || "").trim().toLowerCase();
            const styleClr = (it.style_color || "").trim().toLowerCase();
            const gsm = (it.gsm || "").trim().toLowerCase();
            const dia = (it.dia || "").trim().toLowerCase();
            const counts = (it.counts || "").trim().toLowerCase();
            const proc = (it.process || "").trim().toLowerCase();
            const key = `${proc}-${style}-${styleClr}-${fabric}-${color}-${gsm}-${dia}-${counts}`;

            const used = consumedMap[key] || 0;
            const bal = Math.max(0, (parseFloat(it.qty) || 0) - used);

            if (used > 0) {
                consumedMap[key] = Math.max(0, used - (parseFloat(it.qty) || 0));
            }

            return { ...it, balanced_qty: bal, balanced_pcs: bal };
        }).filter(r => r.balanced_qty > 0.001);

        // Group by Style and Fabric
        const groupedMap = {};
        balancedRows.forEach(row => {
            const key = row.fabric_sku ? (row.fabric_sku.trim() + "-" + (row.style_name || "")).toLowerCase() :
                `${(row.style_name || "").trim()}-${(row.style_color || "").trim()}-${(row.fabric_name || "").trim()}-${(row.gsm || "").trim()}-${(row.dia || "").trim()}-${(row.color || "").trim()}-${(row.counts || "").trim()}`.toLowerCase();

            if (!groupedMap[key]) {
                groupedMap[key] = {
                    ...row,
                    balanced_qty: 0,
                    sizes_data: {}
                };
            }
            groupedMap[key].balanced_qty += parseFloat(row.balanced_qty) || 0;

            // Merge sizes_data correctly
            let rowSz = row.sizes_data;
            if (rowSz && typeof rowSz === 'string') {
                try { rowSz = JSON.parse(rowSz); } catch (e) { rowSz = {}; }
            }
            if (rowSz && typeof rowSz === 'object') {
                Object.entries(rowSz).forEach(([sz, qty]) => {
                    groupedMap[key].sizes_data[sz] = (groupedMap[key].sizes_data[sz] || 0) + (parseFloat(qty) || 0);
                });
            }
        });

        res.json(Object.values(groupedMap));
    } catch (err) {
        console.error("fabric_to_pcs_inward order-process-items error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET single record with items ────────────────────────────────────────────
router.get("/:id", (req, res) => {
    db.query("SELECT * FROM fabric_to_pcs_inward WHERE id = ?", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!rows.length) return res.status(404).json({ message: "Not found" });
        const header = rows[0];
        db.query("SELECT * FROM fabric_to_pcs_inward_items WHERE inward_id = ?", [header.id], (err2, items) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ ...header, items });
        });
    });
});

// ─── POST save new record ───────────────────────────────────────────────────
router.post("/", (req, res) => {
    const {
        inward_type, inward_date, ref_no,
        order_no, order_name,
        lot_no, lot_name,
        internal_lot_no, internal_lot_name,
        party_name, ship_to, work_type = 'Jobwork', contractor_name, process = "Fabric to Pcs",
        size_chart_name,
        remarks, staff_name, staff_remarks,
        total_qty, items = []
    } = req.body;


    const yearId = req.headers['x-year-id'];
    nextInwardNo(inward_type, yearId, (err, inward_no) => {
        if (err) return res.status(500).json({ error: "Failed to generate inward no" });

        const sql = `INSERT INTO fabric_to_pcs_inward
            (inward_no, inward_type, inward_date, ref_no,
             order_no, order_name, lot_no, lot_name,
              internal_lot_no, internal_lot_name,
             party_name, ship_to, work_type, contractor_name, process, size_chart_name, remarks, staff_name, staff_remarks, total_qty, year_id)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;


        const vals = [
            inward_no, inward_type,
            inward_date || null, ref_no || null,
            order_no || null, order_name || null,
            lot_no || null, lot_name || null,
            internal_lot_no || null, internal_lot_name || null,
            party_name || null, ship_to || null, work_type, contractor_name || null, process, size_chart_name || null, remarks || null,
            staff_name || null, staff_remarks || null, total_qty || 0, yearId
        ];


        db.query(sql, vals, (err2, result) => {
            if (err2) return res.status(500).json({ error: err2.message });
            const inwardId = result.insertId;

            if (!items.length) return res.json({ message: "Saved", id: inwardId, inward_no });

            const itemSql = "INSERT INTO fabric_to_pcs_inward_items (inward_id, fabric_sku, counts, fabric_name, style_name, gsm, dia, color, fabric_color, style_color, contractor_name, qty, sizes_data, cut_pcs_wt, waste_pcs_wt) VALUES ?";
            const itemVals = items.map(i => [
                inwardId,
                i.fabric_sku || null,
                i.counts || null,
                i.fabric_name || "",
                i.style_name || null,
                i.gsm || null,
                i.dia || null,
                i.color || null,
                i.fabric_color || null,
                i.style_color || null,
                i.contractor_name || null,
                parseFloat(i.qty) || 0,
                JSON.stringify(i.sizes_data || {}),
                parseFloat(i.cut_pcs_wt) || 0,
                parseFloat(i.waste_pcs_wt) || 0
            ]);

            db.query(itemSql, [itemVals], (err3) => {
                if (err3) {
                    console.error("Items insert failed:", err3);
                    return res.status(500).json({ error: "Items insert failed: " + err3.message });
                }

                // Check if this process should update stock
                db.query("SELECT fabric_in_house_process FROM order_planning WHERE order_no = ? LIMIT 1", [order_no], (errP, ops) => {
                    const inHouseProc = ops?.[0]?.fabric_in_house_process;
                    if (inHouseProc && process && inHouseProc.trim().toLowerCase() === process.trim().toLowerCase()) {
                        items.forEach(item => {
                            const sku = item.fabric_sku || item.fabric_name;
                            const qty = parseFloat(item.qty) || 0;
                            if (sku && qty > 0) {
                                db.query("UPDATE fabrics SET current_stock = IFNULL(current_stock, 0) + ? WHERE fabric_sku = ? OR fabric_name = ?", [qty, sku, item.fabric_name || sku], (errStk) => {
                                    if (errStk) console.error("Stock update error:", errStk);
                                });
                            }
                        });
                    }
                    res.status(201).json({ message: "Saved successfully", id: inwardId, inward_no });
                });
            });
        });
    });
});

// ─── PUT update record ──────────────────────────────────────────────────────
router.put("/:id", (req, res) => {
    const {
        inward_date, ref_no,
        order_no, order_name,
        lot_no, lot_name,
        internal_lot_no, internal_lot_name,
        party_name, ship_to, work_type = 'Jobwork', contractor_name, process = "Fabric to Pcs",
        size_chart_name,
        remarks, staff_name, staff_remarks,
        total_qty, items = []
    } = req.body;


    const sql = `UPDATE fabric_to_pcs_inward SET
        inward_date = ?, ref_no = ?,
        order_no = ?, order_name = ?,
        lot_no = ?, lot_name = ?,
        internal_lot_no = ?, internal_lot_name = ?,
        party_name = ?, ship_to = ?, work_type = ?, contractor_name = ?, process = ?, size_chart_name = ?,
        remarks = ?, staff_name = ?, staff_remarks = ?, total_qty = ?
        WHERE id = ?`;


    const vals = [
        inward_date || null, ref_no || null,
        order_no || null, order_name || null,
        lot_no || null, lot_name || null,
        internal_lot_no || null, internal_lot_name || null,
        party_name || null, ship_to || null, work_type, contractor_name || null, process, size_chart_name || null,
        remarks || null, staff_name || null, staff_remarks || null,
        total_qty || 0,
        req.params.id
    ];


    db.query(sql, vals, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query("SELECT * FROM fabric_to_pcs_inward_items WHERE inward_id = ?", [req.params.id], (errOld, oldItems) => {
            if (!errOld && oldItems.length > 0) {
                // Revert old stock if it was a target process
                db.query("SELECT fabric_in_house_process FROM order_planning WHERE order_no = ? LIMIT 1", [order_no], (errP, ops) => {
                    const inHouseProc = ops?.[0]?.fabric_in_house_process;
                    if (inHouseProc && process && inHouseProc.trim().toLowerCase() === process.trim().toLowerCase()) {
                        oldItems.forEach(item => {
                            const sku = item.fabric_sku || item.fabric_name;
                            const qty = parseFloat(item.qty) || 0;
                            if (sku && qty > 0) {
                                db.query("UPDATE fabrics SET current_stock = GREATEST(IFNULL(current_stock, 0) - ?, 0) WHERE fabric_sku = ? OR fabric_name = ?", [qty, sku, item.fabric_name || sku], (errRevert) => {
                                    if (errRevert) console.error("Stock revert error:", errRevert);
                                });
                            }
                        });
                    }

                    // Delete and Re-insert
                    db.query("DELETE FROM fabric_to_pcs_inward_items WHERE inward_id = ?", [req.params.id], (err2) => {
                        if (err2) return res.status(500).json({ error: err2.message });
                        if (!items.length) return res.json({ message: "Updated" });

                        const itemSql = "INSERT INTO fabric_to_pcs_inward_items (inward_id, fabric_sku, counts, fabric_name, style_name, gsm, dia, color, fabric_color, style_color, contractor_name, qty, sizes_data, cut_pcs_wt, waste_pcs_wt) VALUES ?";
                        const itemVals = items.map(i => [
                            req.params.id,
                            i.fabric_sku || null,
                            i.counts || null,
                            i.fabric_name || "",
                            i.style_name || null,
                            i.gsm || null,
                            i.dia || null,
                            i.color || null,
                            i.fabric_color || null,
                            i.style_color || null,
                            i.contractor_name || null,
                            parseFloat(i.qty) || 0,
                            JSON.stringify(i.sizes_data || {}),
                            parseFloat(i.cut_pcs_wt) || 0,
                            parseFloat(i.waste_pcs_wt) || 0
                        ]);

                        db.query(itemSql, [itemVals], (err3) => {
                            if (err3) return res.status(500).json({ error: "Items update failed" });
                            // Add new stock
                            if (inHouseProc && process && inHouseProc.trim().toLowerCase() === process.trim().toLowerCase()) {
                                items.forEach(item => {
                                    const sku = item.fabric_sku || item.fabric_name;
                                    const qty = parseFloat(item.qty) || 0;
                                    if (sku && qty > 0) {
                                        db.query("UPDATE fabrics SET current_stock = IFNULL(current_stock, 0) + ? WHERE fabric_sku = ? OR fabric_name = ?", [qty, sku, item.fabric_name || sku], (errStk) => {
                                            if (errStk) console.error("Stock update error:", errStk);
                                        });
                                    }
                                });
                            }
                            res.json({ message: "Updated successfully" });
                        });
                    });
                });
            } else {
                // No old items or error, just proceed with normal update (simplified)
                db.query("DELETE FROM fabric_to_pcs_inward_items WHERE inward_id = ?", [req.params.id], (err2) => {
                    if (err2) return res.status(500).json({ error: err2.message });
                    if (!items.length) return res.json({ message: "Updated" });
                    const itemSql = "INSERT INTO fabric_to_pcs_inward_items (inward_id, fabric_sku, counts, fabric_name, style_name, gsm, dia, color, fabric_color, style_color, contractor_name, qty, sizes_data, cut_pcs_wt, waste_pcs_wt) VALUES ?";
                    const itemVals = items.map(i => [req.params.id, i.fabric_sku || null, i.counts || null, i.fabric_name || "", i.style_name || null, i.gsm || null, i.dia || null, i.color || null, i.fabric_color || null, i.style_color || null, i.contractor_name || null, parseFloat(i.qty) || 0, JSON.stringify(i.sizes_data || {}), parseFloat(i.cut_pcs_wt) || 0, parseFloat(i.waste_pcs_wt) || 0]);
                    db.query(itemSql, [itemVals], (err3) => {
                        if (err3) return res.status(500).json({ error: "Items update failed" });
                        res.json({ message: "Updated successfully" });
                    });
                });
            }
        });
    });
});

// ─── BULK DELETE ────────────────────────────────────────────────────────────
router.delete("/bulk", (req, res) => {
    const ids = req.body.ids;
    if (!ids || !ids.length) return res.status(400).json({ error: "No IDs provided" });
    db.query("DELETE FROM fabric_to_pcs_inward WHERE id IN (?)", [ids], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `${ids.length} records deleted` });
    });
});

// ─── DELETE ─────────────────────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
    const inwardId = req.params.id;
    db.query("SELECT * FROM fabric_to_pcs_inward WHERE id = ?", [inwardId], (errH, hRows) => {
        if (errH || !hRows.length) return res.status(404).json({ error: "Record not found" });
        const header = hRows[0];

        db.query("SELECT * FROM fabric_to_pcs_inward_items WHERE inward_id = ?", [inwardId], (errI, items) => {
            if (errI) return res.status(500).json({ error: errI.message });

            db.query("SELECT fabric_in_house_process FROM order_planning WHERE order_no = ? LIMIT 1", [header.order_no], (errP, ops) => {
                const inHouseProc = ops?.[0]?.fabric_in_house_process;

                if (inHouseProc && header.process && inHouseProc.trim().toLowerCase() === header.process.trim().toLowerCase()) {
                    items.forEach(item => {
                        const sku = item.fabric_sku || item.fabric_name;
                        const qty = parseFloat(item.qty) || 0;
                        if (sku && qty > 0) {
                            db.query("UPDATE fabrics SET current_stock = GREATEST(IFNULL(current_stock, 0) - ?, 0) WHERE fabric_sku = ? OR fabric_name = ?", [qty, sku, item.fabric_name || sku], (errR) => {
                                if (errR) console.error("Stock revert on delete error:", errR);
                            });
                        }
                    });
                }

                db.query("DELETE FROM fabric_to_pcs_inward WHERE id = ?", [inwardId], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: "Deleted" });
                });
            });
        });
    });
});

export default router;
