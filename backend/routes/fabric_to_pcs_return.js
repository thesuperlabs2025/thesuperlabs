import express from "express";
import db from "../db.js";

const router = express.Router();

// ─── Auto-create table if not exists ─────────────────────────────────────────
db.query(`CREATE TABLE IF NOT EXISTS fabric_to_pcs_return (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_no VARCHAR(30) NOT NULL,
    return_type ENUM('order','lot','internal') NOT NULL,
    return_date DATE,
    ref_no VARCHAR(100),
    order_no VARCHAR(100), order_name VARCHAR(200),
    lot_no VARCHAR(100), lot_name VARCHAR(200),
    internal_lot_no VARCHAR(100), internal_lot_name VARCHAR(200),
    party_name VARCHAR(200),
    ship_to VARCHAR(200),
    work_type VARCHAR(20) DEFAULT 'Jobwork',
    contractor_name VARCHAR(200),
    process VARCHAR(100) DEFAULT 'Fabric to Pcs',
    remarks TEXT,
    staff_name VARCHAR(200),
    staff_remarks TEXT,
    total_qty DECIMAL(12,3) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, () => {
    // Ensure ship_to exists for older tables
    db.query("ALTER TABLE fabric_to_pcs_return ADD COLUMN ship_to VARCHAR(200) AFTER party_name", () => { });
    db.query("ALTER TABLE fabric_to_pcs_return ADD COLUMN work_type VARCHAR(20) DEFAULT 'Jobwork' AFTER ship_to", () => { });
    db.query("ALTER TABLE fabric_to_pcs_return ADD COLUMN contractor_name VARCHAR(200) AFTER work_type", () => { });
});

db.query(`CREATE TABLE IF NOT EXISTS fabric_to_pcs_return_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_id INT NOT NULL,
    counts VARCHAR(100),
    fabric_name VARCHAR(255),
    style_name VARCHAR(200),
    gsm VARCHAR(50),
    dia VARCHAR(50),
    color VARCHAR(100),
    qty DECIMAL(12,3) DEFAULT 0,
    FOREIGN KEY (return_id) REFERENCES fabric_to_pcs_return(id) ON DELETE CASCADE
)`, () => {
    db.query("ALTER TABLE fabric_to_pcs_return_items ADD COLUMN fabric_sku VARCHAR(100) AFTER return_id", () => { });
    db.query("ALTER TABLE fabric_to_pcs_return_items ADD COLUMN counts VARCHAR(100) AFTER return_id", () => { });
    db.query("ALTER TABLE fabric_to_pcs_return_items ADD COLUMN style_name VARCHAR(200) AFTER fabric_name", () => { });
    db.query("ALTER TABLE fabric_to_pcs_return_items ADD COLUMN gsm VARCHAR(50) AFTER style_name", () => { });
    db.query("ALTER TABLE fabric_to_pcs_return_items ADD COLUMN dia VARCHAR(50) AFTER gsm", () => { });
    db.query("ALTER TABLE fabric_to_pcs_return_items ADD COLUMN contractor_name VARCHAR(200) AFTER color", () => { });
});

// ─── Helper: next return number ────────────────────────────────────────────
function nextReturnNo(type, yearId, cb) {
    db.query(
        "SELECT return_no FROM fabric_to_pcs_return WHERE return_type = ? AND year_id = ? ORDER BY id DESC LIMIT 1",
        [type, yearId],
        (err, rows) => {
            if (err || !rows.length) return cb(null, "0001");
            const last = rows[0].return_no || "";
            const num = parseInt(last.split("-").pop(), 10) || 0;
            const next = String(num + 1).padStart(4, "0");
            cb(null, next);
        }
    );
}

// ─── GET next return number ─────────────────────────────────────────────────
router.get("/next-no/:type", (req, res) => {
    const yearId = req.headers['x-year-id'];
    nextReturnNo(req.params.type, yearId, (err, no) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ return_no: no });
    });
});

// ─── GET all records with filters ────────────────────────────────────────────
router.get("/", (req, res) => {
    const { type, from_date, to_date, search } = req.query;
    const yearId = req.headers['x-year-id'];
    let conditions = ["year_id = ?"];
    let params = [yearId];

    if (type) { conditions.push("return_type = ?"); params.push(type); }
    if (from_date) { conditions.push("DATE(return_date) >= ?"); params.push(from_date); }
    if (to_date) { conditions.push("DATE(return_date) <= ?"); params.push(to_date); }
    if (search) {
        const s = `%${search}%`;
        conditions.push("(return_no LIKE ? OR order_no LIKE ? OR lot_no LIKE ? OR internal_lot_no LIKE ? OR party_name LIKE ? OR ref_no LIKE ?)");
        params.push(s, s, s, s, s, s);
    }

    const where = conditions.length ? " WHERE " + conditions.join(" AND ") : "";
    const q = `SELECT * FROM fabric_to_pcs_return${where} ORDER BY id DESC`;
    db.query(q, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ─── GET single record with items ────────────────────────────────────────────
router.get("/:id", (req, res) => {
    db.query("SELECT * FROM fabric_to_pcs_return WHERE id = ?", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!rows.length) return res.status(404).json({ message: "Not found" });
        const header = rows[0];
        db.query("SELECT * FROM fabric_to_pcs_return_items WHERE return_id = ?", [header.id], (err2, items) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ ...header, items });
        });
    });
});

// ─── POST save new record ───────────────────────────────────────────────────
router.post("/", (req, res) => {
    const {
        return_type, return_date, ref_no,
        order_no, order_name,
        lot_no, lot_name,
        internal_lot_no, internal_lot_name,
        party_name, ship_to, work_type = 'Jobwork', contractor_name, process = "Fabric to Pcs",
        remarks, staff_name, staff_remarks,
        total_qty, items = []
    } = req.body;

    const yearId = req.headers['x-year-id'];
    nextReturnNo(return_type, yearId, (err, return_no) => {
        if (err) return res.status(500).json({ error: "Failed to generate return no" });

        const sql = `INSERT INTO fabric_to_pcs_return
            (return_no, return_type, return_date, ref_no,
             order_no, order_name, lot_no, lot_name,
             internal_lot_no, internal_lot_name,
             party_name, ship_to, work_type, contractor_name, process, remarks, staff_name, staff_remarks, total_qty, year_id)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        const vals = [
            return_no, return_type,
            return_date || null, ref_no || null,
            order_no || null, order_name || null,
            lot_no || null, lot_name || null,
            internal_lot_no || null, internal_lot_name || null,
            party_name || null, ship_to || null, work_type, contractor_name || null, process, remarks || null,
            staff_name || null, staff_remarks || null, total_qty || 0, yearId
        ];

        db.query(sql, vals, (err2, result) => {
            if (err2) return res.status(500).json({ error: err2.message });
            const returnId = result.insertId;

            if (!items.length) return res.json({ message: "Saved", id: returnId, return_no });

            const itemSql = "INSERT INTO fabric_to_pcs_return_items (return_id, fabric_sku, counts, fabric_name, style_name, gsm, dia, color, contractor_name, qty) VALUES ?";
            const itemVals = items.map(i => [returnId, i.fabric_sku || null, i.counts || null, i.fabric_name || "", i.style_name || null, i.gsm || null, i.dia || null, i.color || null, i.contractor_name || null, parseFloat(i.qty) || 0]);

            db.query(itemSql, [itemVals], (err3) => {
                if (err3) {
                    console.error("Items insert failed:", err3);
                    return res.status(500).json({ error: "Items insert failed: " + err3.message });
                }

                // Increase stock
                items.forEach(item => {
                    const sku = item.fabric_sku || item.fabric_name;
                    const qty = parseFloat(item.qty) || 0;
                    if (sku && qty > 0) {
                        db.query("UPDATE fabrics SET current_stock = IFNULL(current_stock, 0) + ? WHERE fabric_sku = ? OR fabric_name = ?", [qty, sku, item.fabric_name || sku], (err) => {
                            if (err) console.error("Fabric stock increment error", err);
                        });
                    }
                });

                res.status(201).json({ message: "Saved successfully", id: returnId, return_no });
            });
        });
    });
});

// ─── PUT update record ──────────────────────────────────────────────────────
router.put("/:id", (req, res) => {
    const {
        return_date, ref_no,
        order_no, order_name,
        lot_no, lot_name,
        internal_lot_no, internal_lot_name,
        party_name, ship_to, work_type = 'Jobwork', contractor_name, process = "Fabric to Pcs",
        remarks, staff_name, staff_remarks,
        total_qty, items = []
    } = req.body;

    const sql = `UPDATE fabric_to_pcs_return SET
        return_date = ?, ref_no = ?,
        order_no = ?, order_name = ?,
        lot_no = ?, lot_name = ?,
        internal_lot_no = ?, internal_lot_name = ?,
        party_name = ?, ship_to = ?, work_type = ?, contractor_name = ?, process = ?,
        remarks = ?, staff_name = ?, staff_remarks = ?, total_qty = ?
        WHERE id = ?`;

    const vals = [
        return_date || null, ref_no || null,
        order_no || null, order_name || null,
        lot_no || null, lot_name || null,
        internal_lot_no || null, internal_lot_name || null,
        party_name || null, ship_to || null, work_type, contractor_name || null, process,
        remarks || null, staff_name || null, staff_remarks || null,
        total_qty || 0,
        req.params.id
    ];

    db.query(sql, vals, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Revert old stock (Reduce because old return increased it)
        db.query("SELECT * FROM fabric_to_pcs_return_items WHERE return_id = ?", [req.params.id], (errStock, oldItems) => {
            if (!errStock && oldItems) {
                oldItems.forEach(item => {
                    const sku = item.fabric_sku || item.fabric_name;
                    const qty = parseFloat(item.qty) || 0;
                    if (sku && qty > 0) {
                        db.query("UPDATE fabrics SET current_stock = GREATEST(IFNULL(current_stock, 0) - ?, 0) WHERE fabric_sku = ? OR fabric_name = ?", [qty, sku, item.fabric_name || sku], (err) => {
                            if (err) console.error("Fabric stock revert error", err);
                        });
                    }
                });
            }

            db.query("DELETE FROM fabric_to_pcs_return_items WHERE return_id = ?", [req.params.id], (err2) => {
                if (err2) return res.status(500).json({ error: err2.message });
                if (!items.length) return res.json({ message: "Updated" });

                const itemSql = "INSERT INTO fabric_to_pcs_return_items (return_id, fabric_sku, counts, fabric_name, style_name, gsm, dia, color, contractor_name, qty) VALUES ?";
                const itemVals = items.map(i => [req.params.id, i.fabric_sku || null, i.counts || null, i.fabric_name || "", i.style_name || null, i.gsm, i.dia, i.color, i.contractor_name || null, i.qty]);

                db.query(itemSql, [itemVals], (err3) => {
                    if (err3) {
                        console.error("Items update failed:", err3);
                        return res.status(500).json({ error: "Items update failed: " + err3.message });
                    }

                    // Increase new stock
                    items.forEach(item => {
                        const sku = item.fabric_sku || item.fabric_name;
                        const qty = parseFloat(item.qty) || 0;
                        if (sku && qty > 0) {
                            db.query("UPDATE fabrics SET current_stock = IFNULL(current_stock, 0) + ? WHERE fabric_sku = ? OR fabric_name = ?", [qty, sku, item.fabric_name || sku], (err) => {
                                if (err) console.error("Fabric stock increment error", err);
                            });
                        }
                    });

                    res.json({ message: "Updated successfully" });
                });
            });
        });
    });
});

// ─── BULK DELETE ────────────────────────────────────────────────────────────
router.delete("/bulk", (req, res) => {
    const ids = req.body.ids;
    if (!ids || !ids.length) return res.status(400).json({ error: "No IDs provided" });

    // Revert stock (Reduce because return had increased it)
    db.query("SELECT * FROM fabric_to_pcs_return_items WHERE return_id IN (?)", [ids], (errStock, items) => {
        if (!errStock && items) {
            items.forEach(item => {
                const sku = item.fabric_sku || item.fabric_name;
                const qty = parseFloat(item.qty) || 0;
                if (sku && qty > 0) {
                    db.query("UPDATE fabrics SET current_stock = GREATEST(IFNULL(current_stock, 0) - ?, 0) WHERE fabric_sku = ? OR fabric_name = ?", [qty, sku, item.fabric_name || sku], (err) => {
                        if (err) console.error("Fabric stock revert error", err);
                    });
                }
            });
        }
        db.query("DELETE FROM fabric_to_pcs_return WHERE id IN (?)", [ids], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: `${ids.length} records deleted` });
        });
    });
});

// ─── DELETE ─────────────────────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
    // Revert stock (Reduce because return had increased it)
    db.query("SELECT * FROM fabric_to_pcs_return_items WHERE return_id = ?", [req.params.id], (errStock, items) => {
        if (!errStock && items) {
            items.forEach(item => {
                const sku = item.fabric_sku || item.fabric_name;
                const qty = parseFloat(item.qty) || 0;
                if (sku && qty > 0) {
                    db.query("UPDATE fabrics SET current_stock = GREATEST(IFNULL(current_stock, 0) - ?, 0) WHERE fabric_sku = ? OR fabric_name = ?", [qty, sku, item.fabric_name || sku], (err) => {
                        if (err) console.error("Fabric stock revert error", err);
                    });
                }
            });
        }
        db.query("DELETE FROM fabric_to_pcs_return WHERE id = ?", [req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Deleted" });
        });
    });
});

export default router;
