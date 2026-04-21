import express from "express";
import db from "../db.js";

const router = express.Router();

// ─── Auto-create table if not exists ─────────────────────────────────────────
db.query(`CREATE TABLE IF NOT EXISTS yarn_dyeing_outward (
    id INT AUTO_INCREMENT PRIMARY KEY,
    outward_no VARCHAR(30) NOT NULL,
    outward_type ENUM('order','lot','internal') NOT NULL,
    outward_date DATE,
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
    db.query("ALTER TABLE yarn_dyeing_outward ADD COLUMN ship_to VARCHAR(200) AFTER party_name", () => { });
});

db.query(`CREATE TABLE IF NOT EXISTS yarn_dyeing_outward_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    outward_id INT NOT NULL,
    yarn_sku VARCHAR(100),
    yarn_name VARCHAR(200),
    counts VARCHAR(100),
    color VARCHAR(100),
    fabric_name VARCHAR(255),
    gsm VARCHAR(50),
    dia VARCHAR(50),
    qty DECIMAL(12,3) DEFAULT 0,
    FOREIGN KEY (outward_id) REFERENCES yarn_dyeing_outward(id) ON DELETE CASCADE
)`, () => {
    // Ensure columns exist for older tables
    db.query("ALTER TABLE yarn_dyeing_outward_items ADD COLUMN yarn_sku VARCHAR(100) AFTER outward_id", () => { });
    db.query("ALTER TABLE yarn_dyeing_outward_items ADD COLUMN fabric_name VARCHAR(255) AFTER color", () => { });
    db.query("ALTER TABLE yarn_dyeing_outward_items ADD COLUMN gsm VARCHAR(50) AFTER fabric_name", () => { });
    db.query("ALTER TABLE yarn_dyeing_outward_items ADD COLUMN dia VARCHAR(50) AFTER gsm", () => { });
});

// ─── Helper: next outward number per type ───────────────────────────────────
function nextOutwardNo(type, yearId, cb) {
    db.query(
        "SELECT outward_no FROM yarn_dyeing_outward WHERE outward_type = ? AND year_id = ? ORDER BY id DESC LIMIT 1",
        [type, yearId],
        (err, rows) => {
            if (err || !rows.length) return cb(null, "0001");
            const last = rows[0].outward_no || "";
            const num = parseInt(last.split("-").pop(), 10) || 0;
            const next = String(num + 1).padStart(4, "0");
            cb(null, next);
        }
    );
}

// ─── GET next outward number ─────────────────────────────────────────────────
router.get("/next-no/:type", (req, res) => {
    const yearId = req.headers['x-year-id'];
    nextOutwardNo(req.params.type, yearId, (err, no) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ outward_no: no });
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

// ─── GET orders list for dropdown ────────────────────────────────────────────
router.get("/orders", (req, res) => {
    const yearId = req.headers['x-year-id'];
    db.query("SELECT id, order_no, order_name FROM order_planning WHERE status != 'Completed' AND year_id = ? ORDER BY id DESC LIMIT 200", [yearId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ─── GET lots list for dropdown ───────────────────────────────────────────────
// (using order_planning with order_type = 'lot' or a separate lot table if available)
router.get("/lots", (req, res) => {
    // Try production_lot table first, fallback to order_planning
    db.query("SHOW TABLES LIKE 'production_lot'", (err, rows) => {
        if (!err && rows.length) {
            db.query("SELECT id, lot_no, lot_name FROM production_lot ORDER BY id DESC LIMIT 200", (err2, data) => {
                if (err2) return res.status(500).json({ error: err2.message });
                res.json(data);
            });
        } else {
            // Fallback: distinct from yarn_dyeing_outward
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

// ─── GET internal lots list for dropdown ─────────────────────────────────────
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

// ─── GET yarn PO + GRN lines for an order (for Load PO in Knitting) ───────────
router.get("/order-yarn-po-grn", (req, res) => {
    const order_no = (req.query.order_no || "").trim();
    if (!order_no) return res.status(400).json({ error: "order_no is required" });
    const yearId = req.headers['x-year-id'];
    const q = `
        SELECT g.grn_no, g.po_no,
               gi.yarn_sku, gi.yarn_name, gi.counts, gi.color, gi.qty AS grn_qty,
               (gi.qty - IFNULL((
                   SELECT SUM(oi.qty)
                   FROM yarn_dyeing_outward_items oi
                   JOIN yarn_dyeing_outward oh ON oi.outward_id = oh.id
                   WHERE oh.order_no = g.order_no
                     AND oh.process = 'Knitting'
                     AND oh.year_id = ?
                     AND (NULLIF(oi.yarn_sku, '') = NULLIF(gi.yarn_sku, '') OR (NULLIF(oi.yarn_sku, '') IS NULL AND NULLIF(gi.yarn_sku, '') IS NULL))
                     AND (NULLIF(oi.yarn_name, '') = NULLIF(gi.yarn_name, '') OR (NULLIF(oi.yarn_name, '') IS NULL AND NULLIF(gi.yarn_name, '') IS NULL))
                     AND (NULLIF(oi.counts, '') = NULLIF(gi.counts, '') OR (NULLIF(oi.counts, '') IS NULL AND NULLIF(gi.counts, '') IS NULL))
                     AND (NULLIF(oi.color, '') = NULLIF(gi.color, '') OR (NULLIF(oi.color, '') IS NULL AND NULLIF(gi.color, '') IS NULL))
               ), 0)) AS pending_qty,
               (SELECT ypi.qty FROM yarn_po yp
                JOIN yarn_po_items ypi ON ypi.po_id = yp.id
                WHERE yp.po_no = g.po_no
                  AND yp.year_id = ?
                  AND (ypi.yarn_sku = gi.yarn_sku OR (ypi.yarn_sku IS NULL AND ypi.yarn_name = gi.yarn_name))
                  AND (ypi.counts <=> gi.counts) AND (ypi.color <=> gi.color)
                LIMIT 1) AS po_qty
        FROM yarn_grn g
        JOIN yarn_grn_items gi ON gi.grn_id = g.id
        WHERE g.order_no = ? AND g.year_id = ?
        HAVING pending_qty > 0.001
        ORDER BY g.grn_date DESC, g.id DESC, gi.id ASC`;
    db.query(q, [yearId, yearId, order_no, yearId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ lines: rows || [] });
    });
});

// ─── GET outward items for an order and process (for Load From Previous) ─────
router.get("/order-process-items", async (req, res) => {
    const { order_no, process } = req.query;
    if (!order_no || !process) return res.status(400).json({ error: "Missing order_no or process" });

    try {
        const outItemsSql = `SELECT i.*, h.party_name, h.ship_to, h.process 
                            FROM yarn_dyeing_outward_items i
                            JOIN yarn_dyeing_outward h ON i.outward_id = h.id
                            WHERE h.order_no = ? AND h.year_id = ? AND h.process = ?`;
        const inItemsSql = `SELECT i.*, h.process FROM yarn_dyeing_inward_items i 
                           JOIN yarn_dyeing_inward h ON i.inward_id = h.id 
                           WHERE h.order_no = ? AND h.year_id = ? AND h.process = ?`;

        const yearId = req.headers['x-year-id'];
        const [outRows] = await db.promise().query(outItemsSql, [order_no, yearId, process]);
        const [inRows] = await db.promise().query(inItemsSql, [order_no, yearId, process]);

        // Map inward quantities for subtraction
        const inMap = {}; // key: yarn-counts-color-fabric-gsm-dia
        inRows.forEach(it => {
            const yarn = (it.yarn_name || "").trim().toLowerCase();
            const counts = (it.counts || "").trim().toLowerCase();
            const color = (it.color || "").trim().toLowerCase();
            const fabric = (it.fabric_name || "").trim().toLowerCase();
            const gsm = (it.gsm || "").trim().toLowerCase();
            const dia = (it.dia || "").trim().toLowerCase();
            const key = `${yarn}-${counts}-${color}-${fabric}-${gsm}-${dia}`;
            inMap[key] = (inMap[key] || 0) + (parseFloat(it.qty) || 0);
        });

        // Calculate balance for outward rows
        const result = outRows.map(it => {
            const yarn = (it.yarn_name || "").trim().toLowerCase();
            const counts = (it.counts || "").trim().toLowerCase();
            const color = (it.color || "").trim().toLowerCase();
            const fabric = (it.fabric_name || "").trim().toLowerCase();
            const gsm = (it.gsm || "").trim().toLowerCase();
            const dia = (it.dia || "").trim().toLowerCase();
            const key = `${yarn}-${counts}-${color}-${fabric}-${gsm}-${dia}`;

            const used = inMap[key] || 0;
            const bal = Math.max(0, (parseFloat(it.qty) || 0) - used);

            // Deduct used amount from map for partial matching logic
            if (used > 0) {
                inMap[key] = Math.max(0, used - (parseFloat(it.qty) || 0));
            }

            return { ...it, balanced_qty: bal };
        }).filter(r => r.balanced_qty > 0.001);

        res.json(result);
    } catch (err) {
        console.error("yarn_dyeing_outward order-process-items error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET all outward records with filters ────────────────────────────────────
router.get("/", (req, res) => {
    const { type, from_date, to_date, search } = req.query;
    let conditions = [];
    let params = [];

    if (type) { conditions.push("outward_type = ?"); params.push(type); }
    if (from_date) { conditions.push("DATE(outward_date) >= ?"); params.push(from_date); }
    if (to_date) { conditions.push("DATE(outward_date) <= ?"); params.push(to_date); }
    if (search) {
        const s = `%${search}%`;
        conditions.push("(outward_no LIKE ? OR order_no LIKE ? OR lot_no LIKE ? OR internal_lot_no LIKE ? OR party_name LIKE ? OR ref_no LIKE ?)");
        params.push(s, s, s, s, s, s);
    }

    const yearId = req.headers['x-year-id'];
    const where = conditions.length ? " WHERE (" + conditions.join(" AND ") + ") AND year_id = ?" : " WHERE year_id = ?";
    const q = `SELECT * FROM yarn_dyeing_outward${where} ORDER BY id DESC`;
    db.query(q, conditions.length ? [...params, yearId] : [yearId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ─── GET single outward with items ───────────────────────────────────────────
router.get("/:id", (req, res) => {
    db.query("SELECT * FROM yarn_dyeing_outward WHERE id = ?", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!rows.length) return res.status(404).json({ message: "Not found" });
        const header = rows[0];
        db.query("SELECT * FROM yarn_dyeing_outward_items WHERE outward_id = ?", [header.id], (err2, items) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ ...header, items });
        });
    });
});

// ─── POST save new outward ────────────────────────────────────────────────────
router.post("/", (req, res) => {
    const {
        outward_type, outward_date, ref_no,
        order_no, order_name,
        lot_no, lot_name,
        internal_lot_no, internal_lot_name,
        party_name, ship_to, process = "Yarn Dyeing",
        remarks, staff_name, staff_remarks,
        total_qty, items = []
    } = req.body;

    console.log("Saving Outward [POST]:", JSON.stringify(req.body, null, 2));

    const yearId = req.headers['x-year-id'];
    nextOutwardNo(outward_type, yearId, (err, outward_no) => {
        if (err) {
            console.error("Error generating nextOutwardNo:", err);
            return res.status(500).json({ error: "Failed to generate outward no: " + err.message });
        }

        const sql = `INSERT INTO yarn_dyeing_outward
            (outward_no, outward_type, outward_date, ref_no,
             order_no, order_name, lot_no, lot_name,
             internal_lot_no, internal_lot_name,
             party_name, ship_to, process, remarks, staff_name, staff_remarks, total_qty, year_id)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        const vals = [
            outward_no, outward_type,
            outward_date || null, ref_no || null,
            order_no || null, order_name || null,
            lot_no || null, lot_name || null,
            internal_lot_no || null, internal_lot_name || null,
            party_name || null, ship_to || null, process, remarks || null,
            staff_name || null, staff_remarks || null,
            total_qty || 0, yearId
        ];

        db.query(sql, vals, (err2, result) => {
            if (err2) {
                console.error("Error inserting yarn_dyeing_outward:", err2);
                return res.status(500).json({ error: err2.message });
            }
            const outwardId = result.insertId;

            if (!items.length) return res.json({ message: "Saved", id: outwardId, outward_no });

            const itemSql = "INSERT INTO yarn_dyeing_outward_items (outward_id, yarn_sku, yarn_name, counts, color, fabric_name, gsm, dia, qty) VALUES ?";
            const itemVals = items.map(i => [
                outwardId,
                i.yarn_sku || null,
                i.yarn_name || null,
                i.counts || null,
                i.color || null,
                i.fabric_name || "",
                i.gsm || null,
                i.dia || null,
                i.qty || 0
            ]);

            // Log items to ensure fabric_name is present
            console.log("Saving items:", JSON.stringify(itemVals));

            db.query(itemSql, [itemVals], (err3) => {
                if (err3) {
                    console.error("Error inserting items:", err3);
                    return res.status(500).json({ error: "Items insert failed: " + err3.message });
                }
                if (process === "Knitting" && items.length > 0) {
                    items.forEach((i) => {
                        const qty = parseFloat(i.qty) || 0;
                        const yarnId = (i.yarn_name || "").toString().trim();
                        if (yarnId && qty > 0) {
                            db.query("UPDATE yarn SET current_stock = GREATEST(0, IFNULL(current_stock, 0) - ?) WHERE yarn_sku = ? OR yarn_name = ?", [qty, yarnId, yarnId], (errStock) => { if (errStock) console.error("Yarn stock update error", errStock); });
                        }
                    });
                }
                res.status(201).json({ message: "Saved successfully", id: outwardId, outward_no });
            });
        });
    });
});

// ─── PUT update outward ───────────────────────────────────────────────────────
router.put("/:id", (req, res) => {
    const {
        outward_date, ref_no,
        order_no, order_name,
        lot_no, lot_name,
        internal_lot_no, internal_lot_name,
        party_name, ship_to, process = "Yarn Dyeing",
        remarks, staff_name, staff_remarks,
        total_qty, items = []
    } = req.body;

    const sql = `UPDATE yarn_dyeing_outward SET
        outward_date = ?, ref_no = ?,
        order_no = ?, order_name = ?,
        lot_no = ?, lot_name = ?,
        internal_lot_no = ?, internal_lot_name = ?,
        party_name = ?, ship_to = ?, process = ?,
        remarks = ?, staff_name = ?, staff_remarks = ?, total_qty = ?
        WHERE id = ?`;

    const vals = [
        outward_date || null, ref_no || null,
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

        db.query("SELECT * FROM yarn_dyeing_outward WHERE id = ?", [req.params.id], (errH, oldRows) => {
            const wasKnitting = oldRows && oldRows[0] && (oldRows[0].process === "Knitting");
            db.query("SELECT * FROM yarn_dyeing_outward_items WHERE outward_id = ?", [req.params.id], (errOld, oldItems) => {
                if (wasKnitting && oldItems && oldItems.length > 0) {
                    oldItems.forEach((i) => {
                        const qty = parseFloat(i.qty) || 0;
                        const yarnId = (i.yarn_name || "").toString().trim();
                        if (yarnId && qty > 0) {
                            db.query("UPDATE yarn SET current_stock = IFNULL(current_stock, 0) + ? WHERE yarn_sku = ? OR yarn_name = ?", [qty, yarnId, yarnId], (e) => { if (e) console.error("Yarn stock revert", e); });
                        }
                    });
                }
                db.query("DELETE FROM yarn_dyeing_outward_items WHERE outward_id = ?", [req.params.id], (err2) => {
                    if (err2) return res.status(500).json({ error: err2.message });
                    if (!items.length) return res.json({ message: "Updated" });

                    const itemSql = "INSERT INTO yarn_dyeing_outward_items (outward_id, yarn_sku, yarn_name, counts, color, fabric_name, gsm, dia, qty) VALUES ?";
                    const itemVals = items.map(i => [req.params.id, i.yarn_sku || null, i.yarn_name, i.counts, i.color, i.fabric_name, i.gsm || null, i.dia || null, i.qty || 0]);
                    db.query(itemSql, [itemVals], (err3) => {
                        if (err3) return res.status(500).json({ error: err3.message });
                        if (process === "Knitting" && items.length > 0) {
                            items.forEach((i) => {
                                const qty = parseFloat(i.qty) || 0;
                                const yarnId = (i.yarn_name || "").toString().trim();
                                if (yarnId && qty > 0) {
                                    db.query("UPDATE yarn SET current_stock = GREATEST(0, IFNULL(current_stock, 0) - ?) WHERE yarn_sku = ? OR yarn_name = ?", [qty, yarnId, yarnId], (e) => { if (e) console.error("Yarn stock update", e); });
                                }
                            });
                        }
                        res.json({ message: "Updated successfully" });
                    });
                });
            });
        });
    });
});

// ─── BULK DELETE outward ────────────────────────────────────────────────────────
router.delete("/bulk", (req, res) => {
    const ids = req.body.ids;
    if (!ids || !ids.length) return res.status(400).json({ error: "No IDs provided" });
    db.query("DELETE FROM yarn_dyeing_outward WHERE id IN (?)", [ids], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `${ids.length} records deleted` });
    });
});

// ─── DELETE outward ───────────────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
    const outwardId = req.params.id;
    db.query("SELECT process FROM yarn_dyeing_outward WHERE id = ?", [outwardId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const wasKnitting = rows && rows[0] && rows[0].process === "Knitting";
        if (wasKnitting) {
            db.query("SELECT yarn_name, qty FROM yarn_dyeing_outward_items WHERE outward_id = ?", [outwardId], (err2, items) => {
                if (!err2 && items && items.length > 0) {
                    items.forEach((i) => {
                        const qty = parseFloat(i.qty) || 0;
                        const yarnId = (i.yarn_name || "").toString().trim();
                        if (yarnId && qty > 0) {
                            db.query("UPDATE yarn SET current_stock = IFNULL(current_stock, 0) + ? WHERE yarn_sku = ? OR yarn_name = ?", [qty, yarnId, yarnId], () => { });
                        }
                    });
                }
                db.query("DELETE FROM yarn_dyeing_outward WHERE id = ?", [outwardId], (err3) => {
                    if (err3) return res.status(500).json({ error: err3.message });
                    res.json({ message: "Deleted" });
                });
            });
        } else {
            db.query("DELETE FROM yarn_dyeing_outward WHERE id = ?", [outwardId], (err3) => {
                if (err3) return res.status(500).json({ error: err3.message });
                res.json({ message: "Deleted" });
            });
        }
    });
});

export default router;
