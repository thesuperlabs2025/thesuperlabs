import express from "express";
import db from "../db.js";

const router = express.Router();

// ─── Auto-create table if not exists ─────────────────────────────────────────
db.query(`CREATE TABLE IF NOT EXISTS yarn_dyeing_return (
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
    process VARCHAR(100) DEFAULT 'Yarn Dyeing',
    remarks TEXT,
    staff_name VARCHAR(200),
    staff_remarks TEXT,
    total_qty DECIMAL(12,3) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, () => {
    // Ensure ship_to exists for older tables
    db.query("ALTER TABLE yarn_dyeing_return ADD COLUMN ship_to VARCHAR(200) AFTER party_name", () => { });
});

db.query(`CREATE TABLE IF NOT EXISTS yarn_dyeing_return_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_id INT NOT NULL,
    yarn_name VARCHAR(200),
    counts VARCHAR(100),
    color VARCHAR(100),
    fabric_name VARCHAR(255),
    gsm VARCHAR(50),
    dia VARCHAR(50),
    qty DECIMAL(12,3) DEFAULT 0,
    FOREIGN KEY (return_id) REFERENCES yarn_dyeing_return(id) ON DELETE CASCADE
)`, () => {
    db.query("ALTER TABLE yarn_dyeing_return_items ADD COLUMN gsm VARCHAR(50) AFTER fabric_name", () => { });
    db.query("ALTER TABLE yarn_dyeing_return_items ADD COLUMN dia VARCHAR(50) AFTER gsm", () => { });
});

// ─── Helper: next return number per type ─────────────────────────────────────
function nextReturnNo(type, yearId, cb) {
    const prefix =
        type === "order" ? "YDR-ORD" :
            type === "lot" ? "YDR-LOT" :
                "YDR-INT";
    db.query(
        "SELECT return_no FROM yarn_dyeing_return WHERE return_type = ? AND year_id = ? ORDER BY id DESC LIMIT 1",
        [type, yearId],
        (err, rows) => {
            if (err || !rows.length) return cb(null, `${prefix}-0001`);
            const last = rows[0].return_no || "";
            const num = parseInt(last.split("-").pop(), 10) || 0;
            const next = String(num + 1).padStart(4, "0");
            cb(null, `${prefix}-${next}`);
        }
    );
}

// ─── GET next return number ──────────────────────────────────────────────────
router.get("/next-no/:type", (req, res) => {
    const yearId = req.headers['x-year-id'];
    nextReturnNo(req.params.type, yearId, (err, no) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ return_no: no });
    });
});

// ─── GET pending balance (Outward - Inward - Return) ──────────────────────────
router.get("/pending-balance", (req, res) => {
    const { type, no, process } = req.query; // no is order_no, lot_no or internal_lot_no
    let col = type === "order" ? "order_no" : type === "lot" ? "lot_no" : "internal_lot_no";

    const yearId = req.headers['x-year-id'];
    const outSql = `
        SELECT i.yarn_name, i.counts, i.color, i.fabric_name, SUM(i.qty) as qty
        FROM yarn_dyeing_outward h
        JOIN yarn_dyeing_outward_items i ON h.id = i.outward_id
        WHERE h.${col} = ? AND h.process = ? AND h.year_id = ?
        GROUP BY i.yarn_name, i.counts, i.color, i.fabric_name
    `;

    const inSql = `
        SELECT i.yarn_name, i.counts, i.color, i.fabric_name, SUM(i.qty) as qty
        FROM yarn_dyeing_inward h
        JOIN yarn_dyeing_inward_items i ON h.id = i.inward_id
        WHERE h.${col} = ? AND h.process = ? AND h.year_id = ?
        GROUP BY i.yarn_name, i.counts, i.color, i.fabric_name
    `;

    const retSql = `
        SELECT i.yarn_name, i.counts, i.color, i.fabric_name, SUM(i.qty) as qty
        FROM yarn_dyeing_return h
        JOIN yarn_dyeing_return_items i ON h.id = i.return_id
        WHERE h.${col} = ? AND h.process = ? AND h.year_id = ?
        GROUP BY i.yarn_name, i.counts, i.color, i.fabric_name
    `;

    db.query(outSql, [no, process, yearId], (err, outRows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!outRows.length) return res.json([]);

        db.query(inSql, [no, process, yearId], (err2, inRows) => {
            if (err2) return res.status(500).json({ error: err2.message });

            db.query(retSql, [no, process, yearId], (err3, retRows) => {
                if (err3) return res.status(500).json({ error: err3.message });

                // Map logic
                const balanceItems = outRows.map(out => {
                    const key = (str) => (str || "").trim().toLowerCase();
                    const isMatch = (item) =>
                        key(item.yarn_name) === key(out.yarn_name) &&
                        key(item.counts) === key(out.counts) &&
                        key(item.color) === key(out.color) &&
                        key(item.fabric_name) === key(out.fabric_name);

                    const inQty = inRows.filter(isMatch).reduce((s, r) => s + (parseFloat(r.qty) || 0), 0);
                    const retQty = retRows.filter(isMatch).reduce((s, r) => s + (parseFloat(r.qty) || 0), 0);
                    const bal = (parseFloat(out.qty) || 0) - inQty - retQty;

                    return { ...out, qty: bal > 0 ? bal : 0, original_qty: out.qty, inward_qty: inQty, returned_qty: retQty };
                }).filter(i => i.qty > 0.001); // Filter out zero balance

                res.json(balanceItems);
            });
        });
    });
});

// ─── GET all return records ──────────────────────────────────────────────────
router.get("/", (req, res) => {
    const { type, from_date, to_date, search } = req.query;
    let conditions = [];
    let params = [];

    if (type) { conditions.push("return_type = ?"); params.push(type); }
    if (from_date) { conditions.push("DATE(return_date) >= ?"); params.push(from_date); }
    if (to_date) { conditions.push("DATE(return_date) <= ?"); params.push(to_date); }
    if (search) {
        const s = `%${search}%`;
        conditions.push("(return_no LIKE ? OR order_no LIKE ? OR lot_no LIKE ? OR internal_lot_no LIKE ? OR party_name LIKE ?)");
        params.push(s, s, s, s, s);
    }

    const yearId = req.headers['x-year-id'];
    const where = conditions.length ? " WHERE (" + conditions.join(" AND ") + ") AND year_id = ?" : " WHERE year_id = ?";
    db.query(`SELECT * FROM yarn_dyeing_return${where} ORDER BY id DESC`, conditions.length ? [...params, yearId] : [yearId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ─── GET single return with items ────────────────────────────────────────────
router.get("/:id", (req, res) => {
    db.query("SELECT * FROM yarn_dyeing_return WHERE id = ?", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!rows.length) return res.status(404).json({ message: "Not found" });
        const header = rows[0];
        db.query("SELECT * FROM yarn_dyeing_return_items WHERE return_id = ?", [header.id], (err2, items) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ ...header, items });
        });
    });
});

// ─── POST save new return ────────────────────────────────────────────────────
router.post("/", (req, res) => {
    const {
        return_type, return_date, ref_no,
        order_no, order_name,
        lot_no, lot_name,
        internal_lot_no, internal_lot_name,
        party_name, ship_to, process = "Yarn Dyeing",
        remarks, staff_name, staff_remarks,
        total_qty, items = []
    } = req.body;

    const yearId = req.headers['x-year-id'];
    nextReturnNo(return_type, yearId, (err, return_no) => {
        if (err) return res.status(500).json({ error: "Failed to generate return no" });

        const sql = `INSERT INTO yarn_dyeing_return
            (return_no, return_type, return_date, ref_no,
             order_no, order_name, lot_no, lot_name,
             internal_lot_no, internal_lot_name,
             party_name, ship_to, process, remarks, staff_name, staff_remarks, total_qty, year_id)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        const vals = [
            return_no, return_type,
            return_date || null, ref_no || null,
            order_no || null, order_name || null,
            lot_no || null, lot_name || null,
            internal_lot_no || null, internal_lot_name || null,
            party_name || null, ship_to || null, process, remarks || null,
            staff_name || null, staff_remarks || null,
            total_qty || 0, yearId
        ];

        db.query(sql, vals, (err2, result) => {
            if (err2) return res.status(500).json({ error: err2.message });
            const returnId = result.insertId;

            if (!items.length) return res.json({ message: "Saved", id: returnId, return_no });

            const itemSql = "INSERT INTO yarn_dyeing_return_items (return_id, yarn_name, counts, color, fabric_name, qty) VALUES ?";
            const itemVals = items.map(i => [returnId, i.yarn_name, i.counts, i.color, i.fabric_name, i.qty || 0]);
            db.query(itemSql, [itemVals], (err3) => {
                if (err3) return res.status(500).json({ error: err3.message });
                res.status(201).json({ message: "Saved successfully", id: returnId, return_no });
            });
        });
    });
});

// ─── PUT update return ───────────────────────────────────────────────────────
router.put("/:id", (req, res) => {
    const {
        return_date, ref_no,
        order_no, order_name,
        lot_no, lot_name,
        internal_lot_no, internal_lot_name,
        party_name, ship_to, process = "Yarn Dyeing",
        remarks, staff_name, staff_remarks,
        total_qty, items = []
    } = req.body;

    const sql = `UPDATE yarn_dyeing_return SET
        return_date = ?, ref_no = ?,
        order_no = ?, order_name = ?,
        lot_no = ?, lot_name = ?,
        internal_lot_no = ?, internal_lot_name = ?,
        party_name = ?, ship_to = ?, process = ?,
        remarks = ?, staff_name = ?, staff_remarks = ?, total_qty = ?
        WHERE id = ?`;

    const vals = [
        return_date || null, ref_no || null,
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
        db.query("DELETE FROM yarn_dyeing_return_items WHERE return_id = ?", [req.params.id], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            if (!items.length) return res.json({ message: "Updated" });

            const itemSql = "INSERT INTO yarn_dyeing_return_items (return_id, yarn_name, counts, color, fabric_name, qty) VALUES ?";
            const itemVals = items.map(i => [req.params.id, i.yarn_name, i.counts, i.color, i.fabric_name, i.qty || 0]);
            db.query(itemSql, [itemVals], (err3) => {
                if (err3) return res.status(500).json({ error: err3.message });
                res.json({ message: "Updated successfully" });
            });
        });
    });
});

// ─── DELETE return ───────────────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
    db.query("DELETE FROM yarn_dyeing_return WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Deleted" });
    });
});

// ─── BULK DELETE return ──────────────────────────────────────────────────────
router.delete("/bulk", (req, res) => {
    const ids = req.body.ids;
    if (!ids || !ids.length) return res.status(400).json({ error: "No IDs provided" });
    db.query("DELETE FROM yarn_dyeing_return WHERE id IN (?)", [ids], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `${ids.length} records deleted` });
    });
});

export default router;
