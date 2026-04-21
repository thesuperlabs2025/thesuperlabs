import express from "express";
import db from "../db.js";

const router = express.Router();

// ─── Auto-create table if not exists ─────────────────────────────────────────
db.query(`CREATE TABLE IF NOT EXISTS yarn_dyeing_inward (
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
    process VARCHAR(100) DEFAULT 'Yarn Dyeing',
    remarks TEXT,
    staff_name VARCHAR(200),
    staff_remarks TEXT,
    total_qty DECIMAL(12,3) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, () => {
    // Ensure ship_to exists for older tables
    db.query("ALTER TABLE yarn_dyeing_inward ADD COLUMN ship_to VARCHAR(200) AFTER party_name", () => { });
});

db.query(`CREATE TABLE IF NOT EXISTS yarn_dyeing_inward_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inward_id INT NOT NULL,
    yarn_name VARCHAR(200),
    counts VARCHAR(100),
    color VARCHAR(100),
    fabric_sku VARCHAR(100),
    fabric_name VARCHAR(255),
    fabric_color VARCHAR(100),
    gsm VARCHAR(50),
    dia VARCHAR(50),
    store VARCHAR(100),
    qty DECIMAL(12,3) DEFAULT 0,
    FOREIGN KEY (inward_id) REFERENCES yarn_dyeing_inward(id) ON DELETE CASCADE
)`, () => {
    // Ensure columns exist for older tables
    db.query("ALTER TABLE yarn_dyeing_inward_items ADD COLUMN fabric_sku VARCHAR(100) AFTER color", () => { });
    db.query("ALTER TABLE yarn_dyeing_inward_items ADD COLUMN fabric_name VARCHAR(255) AFTER fabric_sku", () => { });
    db.query("ALTER TABLE yarn_dyeing_inward_items ADD COLUMN fabric_color VARCHAR(100) AFTER fabric_name", () => { });
    db.query("ALTER TABLE yarn_dyeing_inward_items ADD COLUMN gsm VARCHAR(50) AFTER fabric_color", () => { });
    db.query("ALTER TABLE yarn_dyeing_inward_items ADD COLUMN dia VARCHAR(50) AFTER gsm", () => { });
    db.query("ALTER TABLE yarn_dyeing_inward_items ADD COLUMN store VARCHAR(100) AFTER dia", () => { });
});

// ─── Helper: next inward number per type ─────────────────────────────────────
function nextInwardNo(type, yearId, cb) {
    db.query(
        "SELECT inward_no FROM yarn_dyeing_inward WHERE inward_type = ? AND year_id = ? ORDER BY id DESC LIMIT 1",
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

// ─── GET next inward number ──────────────────────────────────────────────────
router.get("/next-no/:type", (req, res) => {
    const yearId = req.headers['x-year-id'];
    nextInwardNo(req.params.type, yearId, (err, no) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ inward_no: no });
    });
});

// ─── GET yarn autocomplete ────────────────────────────────────────────────────
router.get("/yarn-search", (req, res) => {
    const term = req.query.term || "";
    db.query(
        "SELECT id, yarn_name, counts, color, yarn_sku FROM yarn WHERE yarn_name LIKE ? OR yarn_sku LIKE ? LIMIT 20",
        [`%${term}%`, `%${term}%`],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// ─── GET orders, lots, internal lots for dropdowns ────────────────────────────
router.get("/orders", (req, res) => {
    const yearId = req.headers['x-year-id'];
    db.query("SELECT id, order_no, order_name FROM order_planning WHERE status != 'Completed' AND year_id = ? ORDER BY id DESC LIMIT 200", [yearId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.get("/lots", (req, res) => {
    db.query("SHOW TABLES LIKE 'production_lot'", (err, rows) => {
        if (!err && rows.length) {
            db.query("SELECT id, lot_no, lot_name FROM production_lot ORDER BY id DESC LIMIT 200", (err2, data) => {
                if (err2) return res.status(500).json({ error: err2.message });
                res.json(data);
            });
        } else {
            db.query(
                "SELECT DISTINCT lot_no, lot_name FROM yarn_dyeing_outward WHERE outward_type='lot' AND lot_no IS NOT NULL ORDER BY id DESC LIMIT 200",
                (err2, data) => {
                    if (err2) return res.status(500).json([]);
                    res.json(data);
                }
            );
        }
    });
});

router.get("/internal-lots", (req, res) => {
    db.query("SHOW TABLES LIKE 'internal_lots'", (err, rows) => {
        if (!err && rows.length) {
            db.query("SELECT id, internal_lot_no, internal_lot_name FROM internal_lots ORDER BY id DESC LIMIT 200", (err2, data) => {
                if (err2) return res.status(500).json({ error: err2.message });
                res.json(data);
            });
        } else {
            db.query(
                "SELECT DISTINCT internal_lot_no, internal_lot_name FROM yarn_dyeing_outward WHERE outward_type='internal' AND internal_lot_no IS NOT NULL ORDER BY id DESC LIMIT 200",
                (err2, data) => {
                    if (err2) return res.status(500).json([]);
                    res.json(data);
                }
            );
        }
    });
});

// ─── GET pending outward details for loading ──────────────────────────────────
router.get("/pending-outward", (req, res) => {
    const { type, no, process } = req.query; // no is order_no, lot_no or internal_lot_no
    let col = type === "order" ? "order_no" : type === "lot" ? "lot_no" : "internal_lot_no";

    // Fetch outward records that match criteria
    const sql = `
        SELECT h.id, h.outward_no, h.outward_date, h.party_name, h.process, h.total_qty,
               JSON_ARRAYAGG(JSON_OBJECT(
                   'yarn_name', i.yarn_name,
                   'counts', i.counts,
                   'color', i.color,
                   'fabric_name', i.fabric_name,
                   'gsm', i.gsm,
                   'dia', i.dia,
                   'qty', i.qty
               )) as items
        FROM yarn_dyeing_outward h
        JOIN yarn_dyeing_outward_items i ON h.id = i.outward_id
        WHERE h.${col} = ? AND h.process = ? AND h.year_id = ?
        GROUP BY h.id
        ORDER BY h.id DESC
        LIMIT 50
    `;
    const yearId = req.headers['x-year-id'];
    db.query(sql, [no, process, yearId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ─── GET inward items for an order and process (for Load Previous) ───────────
router.get("/order-process-items", async (req, res) => {
    const { order_no, process } = req.query;
    if (!order_no || !process) return res.status(400).json({ error: "Missing order_no or process" });

    try {
        const inItemsSql = `SELECT i.*, h.party_name, h.ship_to, h.process 
                           FROM yarn_dyeing_inward_items i
                           JOIN yarn_dyeing_inward h ON i.inward_id = h.id
                           WHERE h.order_no = ? AND h.year_id = ? AND (h.process = ? OR h.process = ?)`;

        const retItemsSql = `SELECT i.*, h.process FROM yarn_dyeing_return_items i 
                            JOIN yarn_dyeing_return h ON i.return_id = h.id 
                            WHERE h.order_no = ? AND h.year_id = ?`;

        const outItemsSql = `SELECT i.*, h.previous_process FROM yarn_dyeing_outward_items i
                            JOIN yarn_dyeing_outward h ON i.outward_id = h.id
                            WHERE h.order_no = ? AND h.year_id = ?`;

        const yearId = req.headers['x-year-id'];
        const [inRows] = await db.promise().query(inItemsSql, [order_no, yearId, process, req.query.alt_process || process]);
        const [retRows] = await db.promise().query(retItemsSql, [order_no, yearId]);
        const [outRows] = await db.promise().query(outItemsSql, [order_no, yearId]);

        // Map consumption quantities for subtraction
        const consumedMap = {}; // key: process-yarn-counts-color-fabric-gsm-dia

        // 1. Add returns to consumption
        retRows.forEach(it => {
            const yarn = (it.yarn_name || "").trim().toLowerCase();
            const counts = (it.counts || "").trim().toLowerCase();
            const color = (it.color || "").trim().toLowerCase();
            const fabric = (it.fabric_name || "").trim().toLowerCase();
            const gsm = (it.gsm || "").trim().toLowerCase();
            const dia = (it.dia || "").trim().toLowerCase();
            const proc = (it.process || "").trim().toLowerCase();
            const key = `${proc}-${yarn}-${counts}-${color}-${fabric}-${gsm}-${dia}`;
            consumedMap[key] = (consumedMap[key] || 0) + (parseFloat(it.qty) || 0);
        });

        // 2. Add outwards to consumption (outwards consume their previous_process)
        outRows.forEach(it => {
            if (!it.previous_process) return;
            const yarn = (it.yarn_name || "").trim().toLowerCase();
            const counts = (it.counts || "").trim().toLowerCase();
            const color = (it.color || "").trim().toLowerCase();
            const fabric = (it.fabric_name || "").trim().toLowerCase();
            const gsm = (it.gsm || "").trim().toLowerCase();
            const dia = (it.dia || "").trim().toLowerCase();
            const prevProc = (it.previous_process || "").trim().toLowerCase();
            const key = `${prevProc}-${yarn}-${counts}-${color}-${fabric}-${gsm}-${dia}`;
            consumedMap[key] = (consumedMap[key] || 0) + (parseFloat(it.qty) || 0);
        });

        // Calculate balance
        const result = inRows.map(it => {
            const yarn = (it.yarn_name || "").trim().toLowerCase();
            const counts = (it.counts || "").trim().toLowerCase();
            const color = (it.color || "").trim().toLowerCase();
            const fabric = (it.fabric_name || "").trim().toLowerCase();
            const gsm = (it.gsm || "").trim().toLowerCase();
            const dia = (it.dia || "").trim().toLowerCase();
            const proc = (it.process || "").trim().toLowerCase();
            const key = `${proc}-${yarn}-${counts}-${color}-${fabric}-${gsm}-${dia}`;

            const used = consumedMap[key] || 0;
            const bal = Math.max(0, (parseFloat(it.qty) || 0) - used);

            if (used > 0) {
                consumedMap[key] = Math.max(0, used - (parseFloat(it.qty) || 0));
            }

            return { ...it, balanced_qty: bal };
        }).filter(r => r.balanced_qty > 0.001);

        res.json(result);
    } catch (err) {
        console.error("yarn_dyeing_inward order-process-items error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET all inward records with filters ─────────────────────────────────────
router.get("/", (req, res) => {
    const { type, from_date, to_date, search } = req.query;
    let conditions = [];
    let params = [];

    if (type) { conditions.push("inward_type = ?"); params.push(type); }
    if (from_date) { conditions.push("DATE(inward_date) >= ?"); params.push(from_date); }
    if (to_date) { conditions.push("DATE(inward_date) <= ?"); params.push(to_date); }
    if (search) {
        const s = `%${search}%`;
        conditions.push("(inward_no LIKE ? OR order_no LIKE ? OR lot_no LIKE ? OR internal_lot_no LIKE ? OR party_name LIKE ? OR ref_no LIKE ?)");
        params.push(s, s, s, s, s, s);
    }

    const yearId = req.headers['x-year-id'];
    const where = conditions.length ? " WHERE (" + conditions.join(" AND ") + ") AND year_id = ?" : " WHERE year_id = ?";
    db.query(`SELECT * FROM yarn_dyeing_inward${where} ORDER BY id DESC`, conditions.length ? [...params, yearId] : [yearId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ─── GET single inward with items ────────────────────────────────────────────
router.get("/:id", (req, res) => {
    db.query("SELECT * FROM yarn_dyeing_inward WHERE id = ?", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!rows.length) return res.status(404).json({ message: "Not found" });
        const header = rows[0];
        db.query("SELECT * FROM yarn_dyeing_inward_items WHERE inward_id = ?", [header.id], (err2, items) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ ...header, items });
        });
    });
});

// ─── POST save new inward ─────────────────────────────────────────────────────
router.post("/", (req, res) => {
    const {
        inward_type, inward_date, ref_no,
        order_no, order_name,
        lot_no, lot_name,
        internal_lot_no, internal_lot_name,
        party_name, ship_to, process = "Yarn Dyeing",
        remarks, staff_name, staff_remarks,
        total_qty, items = []
    } = req.body;

    const yearId = req.headers['x-year-id'];
    nextInwardNo(inward_type, yearId, (err, inward_no) => {
        if (err) return res.status(500).json({ error: "Failed to generate inward no" });

        const sql = `INSERT INTO yarn_dyeing_inward
            (inward_no, inward_type, inward_date, ref_no,
             order_no, order_name, lot_no, lot_name,
             internal_lot_no, internal_lot_name,
             party_name, ship_to, process, remarks, staff_name, staff_remarks, total_qty, year_id)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        const vals = [
            inward_no, inward_type,
            inward_date || null, ref_no || null,
            order_no || null, order_name || null,
            lot_no || null, lot_name || null,
            internal_lot_no || null, internal_lot_name || null,
            party_name || null, ship_to || null, process, remarks || null,
            staff_name || null, staff_remarks || null,
            total_qty || 0, yearId
        ];

        db.query(sql, vals, async (err2, result) => {
            if (err2) return res.status(500).json({ error: err2.message });
            const inwardId = result.insertId;

            if (!items.length) return res.json({ message: "Saved", id: inwardId, inward_no });

            const itemSql = "INSERT INTO yarn_dyeing_inward_items (inward_id, yarn_name, counts, color, fabric_sku, fabric_name, fabric_color, gsm, dia, store, qty) VALUES ?";
            const itemVals = items.map(i => [
                inwardId, i.yarn_name, i.counts, i.color,
                i.fabric_sku || null, i.fabric_name, i.fabric_color || null,
                i.gsm || null, i.dia || null, i.store || null, i.qty || 0
            ]);

            db.query(itemSql, [itemVals], async (err3) => {
                if (err3) return res.status(500).json({ error: err3.message });

                // Check if we should update fabric stock (If this is the in-house process)
                if (order_no) {
                    try {
                        const [orderRows] = await db.promise().query("SELECT fabric_in_house_process FROM order_planning WHERE order_no = ? LIMIT 1", [order_no]);
                        if (orderRows.length > 0 && orderRows[0].fabric_in_house_process === process) {
                            console.log("Updating fabric stock for in-house process:", process);
                            for (const item of items) {
                                if (item.fabric_name && (parseFloat(item.qty) > 0)) {
                                    // Try updating by SKU first if available
                                    if (item.fabric_sku) {
                                        await db.promise().query(
                                            "UPDATE fabrics SET current_stock = COALESCE(current_stock, 0) + ? WHERE fabric_sku = ?",
                                            [item.qty, item.fabric_sku]
                                        );
                                    } else {
                                        // Update by fabric details
                                        await db.promise().query(
                                            "UPDATE fabrics SET current_stock = COALESCE(current_stock, 0) + ? WHERE fabric_name = ? AND gsm = ? AND dia = ?",
                                            [item.qty, item.fabric_name, item.gsm, item.dia]
                                        );
                                    }
                                }
                            }
                        }
                    } catch (stockErr) {
                        console.error("Fabric stock update error:", stockErr);
                        // We don't fail the whole request but log it
                    }
                }

                res.status(201).json({ message: "Saved successfully", id: inwardId, inward_no });
            });
        });
    });
});

// ─── PUT update inward ────────────────────────────────────────────────────────
router.put("/:id", (req, res) => {
    const {
        inward_date, ref_no,
        order_no, order_name,
        lot_no, lot_name,
        internal_lot_no, internal_lot_name,
        party_name, ship_to, process = "Yarn Dyeing",
        remarks, staff_name, staff_remarks,
        total_qty, items = []
    } = req.body;

    const sql = `UPDATE yarn_dyeing_inward SET
        inward_date = ?, ref_no = ?,
        order_no = ?, order_name = ?,
        lot_no = ?, lot_name = ?,
        internal_lot_no = ?, internal_lot_name = ?,
        party_name = ?, ship_to = ?, process = ?,
        remarks = ?, staff_name = ?, staff_remarks = ?, total_qty = ?
        WHERE id = ?`;

    const vals = [
        inward_date || null, ref_no || null,
        order_no || null, order_name || null,
        lot_no || null, lot_name || null,
        internal_lot_no || null, internal_lot_name || null,
        party_name || null, ship_to || null, process,
        remarks || null, staff_name || null, staff_remarks || null,
        total_qty || 0,
        req.params.id
    ];

    db.query(sql, vals, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query("DELETE FROM yarn_dyeing_inward_items WHERE inward_id = ?", [req.params.id], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            if (!items.length) return res.json({ message: "Updated" });

            const itemSql = "INSERT INTO yarn_dyeing_inward_items (inward_id, yarn_name, counts, color, fabric_sku, fabric_name, fabric_color, gsm, dia, store, qty) VALUES ?";
            const itemVals = items.map(i => [
                req.params.id, i.yarn_name, i.counts, i.color,
                i.fabric_sku || null, i.fabric_name, i.fabric_color || null,
                i.gsm || null, i.dia || null, i.store || null, i.qty || 0
            ]);

            db.query(itemSql, [itemVals], (err3) => {
                if (err3) return res.status(500).json({ error: err3.message });
                res.json({ message: "Updated successfully" });
            });
        });
    });
});

// ─── BULK DELETE inward ────────────────────────────────────────────────────────
router.delete("/bulk", (req, res) => {
    const ids = req.body.ids;
    if (!ids || !ids.length) return res.status(400).json({ error: "No IDs provided" });
    db.query("DELETE FROM yarn_dyeing_inward WHERE id IN (?)", [ids], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `${ids.length} records deleted` });
    });
});

// ─── DELETE inward ─────────────────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
    db.query("DELETE FROM yarn_dyeing_inward WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Deleted" });
    });
});

export default router;
