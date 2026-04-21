import express from "express";
import db from "../db.js";

const router = express.Router();

// ─── Auto-create table if not exists ─────────────────────────────────────────
db.query(`CREATE TABLE IF NOT EXISTS pcs_outward (
    id INT AUTO_INCREMENT PRIMARY KEY,
    outward_no VARCHAR(30) NOT NULL,
    outward_type ENUM('order') NOT NULL DEFAULT 'order',
    outward_date DATE,
    ref_no VARCHAR(100),
    order_no VARCHAR(100), order_name VARCHAR(200),
    party_name VARCHAR(200),
    ship_to VARCHAR(200),
    work_type ENUM('Jobwork', 'Contractor') DEFAULT 'Jobwork',
    contractor_name VARCHAR(255),
    process VARCHAR(100),
    previous_process VARCHAR(100),
    remarks TEXT,
    staff_name VARCHAR(200),
    staff_remarks TEXT,
    total_pcs INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, () => {
    db.query("ALTER TABLE pcs_outward ADD COLUMN ship_to VARCHAR(200) AFTER party_name", () => { });
    db.query("ALTER TABLE pcs_outward ADD COLUMN size_chart_name VARCHAR(100) AFTER process", () => { });
    db.query("ALTER TABLE pcs_outward ADD COLUMN previous_process VARCHAR(100) AFTER process", () => { });
    db.query("ALTER TABLE pcs_outward ADD COLUMN work_type ENUM('Jobwork', 'Contractor') DEFAULT 'Jobwork' AFTER outward_type", () => { });
    db.query("ALTER TABLE pcs_outward ADD COLUMN contractor_name VARCHAR(255) AFTER work_type", () => { });
});

db.query(`CREATE TABLE IF NOT EXISTS pcs_outward_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    outward_id INT NOT NULL,
    item_name VARCHAR(255),
    style_name VARCHAR(255),
    color VARCHAR(100),
    style_color VARCHAR(100),
    size VARCHAR(50),
    pcs INT DEFAULT 0,
    FOREIGN KEY (outward_id) REFERENCES pcs_outward(id) ON DELETE CASCADE
)`, () => {
    db.query("ALTER TABLE pcs_outward_items ADD COLUMN style_name VARCHAR(255) AFTER item_name", () => { });
    db.query("ALTER TABLE pcs_outward_items ADD COLUMN style_color VARCHAR(100) AFTER color", () => { });
    db.query("ALTER TABLE pcs_outward_items ADD COLUMN sizes_data JSON AFTER pcs", () => { });
    db.query("ALTER TABLE pcs_outward_items ADD COLUMN contractor_name VARCHAR(255) AFTER size", () => { });
});


// ─── Helper: next outward number ────────────────────────────────────────────
function nextOutwardNo(yearId, cb) {
    db.query(
        "SELECT outward_no FROM pcs_outward WHERE outward_type = 'order' AND year_id = ? ORDER BY id DESC LIMIT 1",
        [yearId],
        (err, rows) => {
            if (err || !rows.length) return cb(null, "PCS-OUT-0001");
            const last = rows[0].outward_no || "";
            const parts = last.split("-");
            const num = parseInt(parts[parts.length - 1], 10) || 0;
            const next = "PCS-OUT-" + String(num + 1).padStart(4, "0");
            cb(null, next);
        }
    );
}

router.get("/next-no/order", (req, res) => {
    const yearId = req.headers['x-year-id'];
    nextOutwardNo(yearId, (err, no) => res.json({ outward_no: no }));
});

// ─── CRUD ──────────────────────────────────────────────────────────────────
router.post("/", (req, res) => {
    const { outward_date, ref_no, order_no, order_name, party_name, ship_to, process, previous_process, size_chart_name, work_type = 'Jobwork', contractor_name, remarks, staff_name, staff_remarks, total_pcs, items } = req.body;
    const yearId = req.headers['x-year-id'];
    nextOutwardNo(yearId, (err, no) => {
        const sql = `INSERT INTO pcs_outward (outward_no, outward_type, work_type, contractor_name, outward_date, ref_no, order_no, order_name, party_name, ship_to, process, previous_process, size_chart_name, remarks, staff_name, staff_remarks, total_pcs, year_id) VALUES (?, 'order', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(sql, [no, work_type, contractor_name, outward_date, ref_no, order_no, order_name, party_name, ship_to, process, previous_process, size_chart_name, remarks, staff_name, staff_remarks, total_pcs, yearId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            const outward_id = result.insertId;
            if (items && items.length) {
                const itemData = items.map(it => [outward_id, it.item_name, it.style_name, it.color, it.style_color, it.size, it.contractor_name, it.pcs, JSON.stringify(it.sizes_data || {})]);
                db.query("INSERT INTO pcs_outward_items (outward_id, item_name, style_name, color, style_color, size, contractor_name, pcs, sizes_data) VALUES ?", [itemData], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ id: outward_id, outward_no: no });
                });
            } else {
                res.json({ id: outward_id, outward_no: no });
            }
        });
    });
});

router.get("/", (req, res) => {
    const { from_date, to_date } = req.query;
    const yearId = req.headers['x-year-id'];
    let sql = "SELECT * FROM pcs_outward WHERE outward_type = 'order' AND year_id = ?";
    const params = [yearId];
    if (from_date && to_date) {
        sql += " AND outward_date BETWEEN ? AND ?";
        params.push(from_date, to_date);
    }
    sql += " ORDER BY id DESC";
    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ─── GET items by order status (for loading into inward/return) ──────────────
router.get("/by-order/:order_no", async (req, res) => {
    const { order_no } = req.params;
    const yearId = req.headers['x-year-id'];
    try {
        const outItemsSql = `SELECT h.outward_no, h.outward_date, h.party_name, h.ship_to, h.process, h.size_chart_name, h.work_type, h.contractor_name as header_contractor, i.* 
                            FROM pcs_outward_items i
                            JOIN pcs_outward h ON i.outward_id = h.id
                            WHERE h.order_no = ? AND h.year_id = ?`;
        const inItemsSql = `SELECT i.*, h.process FROM pcs_inward_items i 
                           JOIN pcs_inward h ON i.inward_id = h.id 
                           WHERE h.order_no = ? AND h.year_id = ?`;

        const [outRows] = await db.promise().query(outItemsSql, [order_no, yearId]);
        const [inRows] = await db.promise().query(inItemsSql, [order_no, yearId]);

        // Map inward quantities for subtraction
        const inMap = {}; // key: process-style-color-size
        inRows.forEach(it => {
            const style = (it.style_name || it.item_name || "").trim().toLowerCase();
            const color = (it.style_color || it.color || "").trim().toLowerCase();
            const process = (it.process || "").trim().toLowerCase();
            const szData = it.sizes_data ? (typeof it.sizes_data === 'string' ? JSON.parse(it.sizes_data) : it.sizes_data) : {};

            if (Object.keys(szData).length > 0) {
                Object.entries(szData).forEach(([sz, qty]) => {
                    const key = `${process}-${style}-${color}-${sz.toLowerCase()}`;
                    inMap[key] = (inMap[key] || 0) + (parseFloat(qty) || 0);
                });
            } else if (it.size) {
                const key = `${process}-${style}-${color}-${it.size.toLowerCase()}`;
                inMap[key] = (inMap[key] || 0) + (parseFloat(it.pcs) || 0);
            } else {
                const key = `${process}-${style}-${color}-no-size`;
                inMap[key] = (inMap[key] || 0) + (parseFloat(it.pcs) || 0);
            }
        });

        // Calculate balance for outward rows
        const result = outRows.map(it => {
            const style = (it.style_name || it.item_name || "").trim().toLowerCase();
            const color = (it.style_color || it.color || "").trim().toLowerCase();
            const process = (it.process || "").trim().toLowerCase();
            const szData = it.sizes_data ? (typeof it.sizes_data === 'string' ? JSON.parse(it.sizes_data) : it.sizes_data) : {};

            let balancedPcs = 0;
            const newSzData = {};

            if (Object.keys(szData).length > 0) {
                Object.entries(szData).forEach(([sz, qty]) => {
                    const key = `${process}-${style}-${color}-${sz.toLowerCase()}`;
                    const used = inMap[key] || 0;
                    const bal = Math.max(0, (parseFloat(qty) || 0) - used);
                    newSzData[sz] = bal;
                    balancedPcs += bal;
                    // Deduct used amount from map for partial matching logic (though usually 1:1)
                    if (used > 0) inMap[key] = Math.max(0, used - (parseFloat(qty) || 0));
                });
            } else if (it.size) {
                const key = `${process}-${style}-${color}-${it.size.toLowerCase()}`;
                const used = inMap[key] || 0;
                balancedPcs = Math.max(0, (parseFloat(it.pcs) || 0) - used);
                if (used > 0) inMap[key] = Math.max(0, used - (parseFloat(it.pcs) || 0));
            } else {
                const key = `${process}-${style}-${color}-no-size`;
                const used = inMap[key] || 0;
                balancedPcs = Math.max(0, (parseFloat(it.pcs) || 0) - used);
                if (used > 0) inMap[key] = Math.max(0, used - (parseFloat(it.pcs) || 0));
            }

            return { ...it, balanced_pcs: balancedPcs, sizes_data: newSzData };
        }).filter(r => r.balanced_pcs > 0);

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", (req, res) => {
    db.query("SELECT * FROM pcs_outward WHERE id = ?", [req.params.id], (err, rows) => {
        if (err || !rows.length) return res.status(404).json({ error: "Not found" });
        const record = rows[0];
        db.query("SELECT * FROM pcs_outward_items WHERE outward_id = ?", [req.params.id], (err, items) => {
            record.items = items || [];
            res.json(record);
        });
    });
});

router.put("/:id", (req, res) => {
    const { outward_date, ref_no, order_no, order_name, party_name, ship_to, process, previous_process, size_chart_name, work_type = 'Jobwork', contractor_name, remarks, staff_name, staff_remarks, total_pcs, items } = req.body;
    const sql = `UPDATE pcs_outward SET outward_date=?, ref_no=?, order_no=?, order_name=?, party_name=?, ship_to=?, process=?, previous_process=?, size_chart_name=?, work_type=?, contractor_name=?, remarks=?, staff_name=?, staff_remarks=?, total_pcs=? WHERE id=?`;
    db.query(sql, [outward_date, ref_no, order_no, order_name, party_name, ship_to, process, previous_process, size_chart_name, work_type, contractor_name, remarks, staff_name, staff_remarks, total_pcs, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query("DELETE FROM pcs_outward_items WHERE outward_id = ?", [req.params.id], () => {
            if (items && items.length) {
                const itemData = items.map(it => [req.params.id, it.item_name, it.style_name, it.color, it.style_color, it.size, it.contractor_name, it.pcs, JSON.stringify(it.sizes_data || {})]);
                db.query("INSERT INTO pcs_outward_items (outward_id, item_name, style_name, color, style_color, size, contractor_name, pcs, sizes_data) VALUES ?", [itemData], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true });
                });
            } else res.json({ success: true });
        });
    });
});

router.delete("/:id", (req, res) => {
    db.query("DELETE FROM pcs_outward WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

export default router;
