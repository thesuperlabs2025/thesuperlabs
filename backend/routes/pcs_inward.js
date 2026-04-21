import express from "express";
import db from "../db.js";

const router = express.Router();

// ─── Auto-create table if not exists ─────────────────────────────────────────
db.query(`CREATE TABLE IF NOT EXISTS pcs_inward (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inward_no VARCHAR(30) NOT NULL,
    inward_type ENUM('order') NOT NULL DEFAULT 'order',
    inward_date DATE,
    ref_no VARCHAR(100),
    order_no VARCHAR(100), order_name VARCHAR(200),
    party_name VARCHAR(200),
    ship_to VARCHAR(200),
    work_type ENUM('Jobwork', 'Contractor') DEFAULT 'Jobwork',
    contractor_name VARCHAR(255),
    process VARCHAR(100),
    remarks TEXT,
    staff_name VARCHAR(200),
    staff_remarks TEXT,
    total_pcs INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, () => {
    db.query("ALTER TABLE pcs_inward ADD COLUMN ship_to VARCHAR(200) AFTER party_name", () => { });
    db.query("ALTER TABLE pcs_inward ADD COLUMN size_chart_name VARCHAR(100) AFTER process", () => { });
    db.query("ALTER TABLE pcs_inward ADD COLUMN work_type ENUM('Jobwork', 'Contractor') DEFAULT 'Jobwork' AFTER inward_type", () => { });
    db.query("ALTER TABLE pcs_inward ADD COLUMN contractor_name VARCHAR(255) AFTER work_type", () => { });
});

db.query(`CREATE TABLE IF NOT EXISTS pcs_inward_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inward_id INT NOT NULL,
    item_name VARCHAR(255),
    style_name VARCHAR(255),
    color VARCHAR(100),
    style_color VARCHAR(100),
    size VARCHAR(50),
    pcs INT DEFAULT 0,
    FOREIGN KEY (inward_id) REFERENCES pcs_inward(id) ON DELETE CASCADE
)`, () => {
    db.query("ALTER TABLE pcs_inward_items ADD COLUMN style_name VARCHAR(255) AFTER item_name", () => { });
    db.query("ALTER TABLE pcs_inward_items ADD COLUMN style_color VARCHAR(100) AFTER color", () => { });
    db.query("ALTER TABLE pcs_inward_items ADD COLUMN sizes_data JSON AFTER pcs", () => { });
    db.query("ALTER TABLE pcs_inward_items ADD COLUMN contractor_name VARCHAR(255) AFTER size", () => { });
});


// ─── Helper: next inward number ────────────────────────────────────────────
function nextInwardNo(yearId, cb) {
    db.query(
        "SELECT inward_no FROM pcs_inward WHERE inward_type = 'order' AND year_id = ? ORDER BY id DESC LIMIT 1",
        [yearId],
        (err, rows) => {
            if (err || !rows.length) return cb(null, "PCS-IN-0001");
            const last = rows[0].inward_no || "";
            const parts = last.split("-");
            const num = parseInt(parts[parts.length - 1], 10) || 0;
            const next = "PCS-IN-" + String(num + 1).padStart(4, "0");
            cb(null, next);
        }
    );
}

router.get("/next-no/order", (req, res) => {
    const yearId = req.headers['x-year-id'];
    nextInwardNo(yearId, (err, no) => res.json({ inward_no: no }));
});

// ─── CRUD ──────────────────────────────────────────────────────────────────
router.post("/", (req, res) => {
    const { inward_date, ref_no, order_no, order_name, party_name, ship_to, process, size_chart_name, work_type = 'Jobwork', contractor_name, remarks, staff_name, staff_remarks, total_pcs, items } = req.body;
    const yearId = req.headers['x-year-id'];
    nextInwardNo(yearId, (err, no) => {
        const sql = `INSERT INTO pcs_inward (inward_no, inward_type, work_type, contractor_name, inward_date, ref_no, order_no, order_name, party_name, ship_to, process, size_chart_name, remarks, staff_name, staff_remarks, total_pcs, year_id) VALUES (?, 'order', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(sql, [no, work_type, contractor_name, inward_date, ref_no, order_no, order_name, party_name, ship_to, process, size_chart_name, remarks, staff_name, staff_remarks, total_pcs, yearId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            const inward_id = result.insertId;
            if (items && items.length) {
                const itemData = items.map(it => [inward_id, it.item_name, it.style_name, it.color, it.style_color, it.size, it.contractor_name, it.pcs, JSON.stringify(it.sizes_data || {})]);
                db.query("INSERT INTO pcs_inward_items (inward_id, item_name, style_name, color, style_color, size, contractor_name, pcs, sizes_data) VALUES ?", [itemData], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ id: inward_id, inward_no: no });
                });
            } else {
                res.json({ id: inward_id, inward_no: no });
            }
        });
    });
});

router.get("/", (req, res) => {
    const { from_date, to_date } = req.query;
    const yearId = req.headers['x-year-id'];
    let sql = "SELECT * FROM pcs_inward WHERE inward_type = 'order' AND year_id = ?";
    const params = [yearId];
    if (from_date && to_date) {
        sql += " AND inward_date BETWEEN ? AND ?";
        params.push(from_date, to_date);
    }
    sql += " ORDER BY id DESC";
    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Added for loading previous items into Outward or Return forms
router.get("/by-order/:order_no", async (req, res) => {
    const { order_no } = req.params;
    const yearId = req.headers['x-year-id'];
    try {
        const inItemsSql = `SELECT h.inward_no, h.inward_date, h.party_name, h.ship_to, h.process, h.size_chart_name, h.work_type, h.contractor_name as header_contractor, i.* 
                            FROM pcs_inward_items i
                            JOIN pcs_inward h ON i.inward_id = h.id
                            WHERE h.order_no = ? AND h.year_id = ?`;
        const retItemsSql = `SELECT i.*, h.process FROM pcs_return_items i 
                            JOIN pcs_return h ON i.return_id = h.id 
                            WHERE h.order_no = ? AND h.year_id = ?`;

        const [inRows] = await db.promise().query(inItemsSql, [order_no, yearId]);
        const [retRows] = await db.promise().query(retItemsSql, [order_no, yearId]);

        const retMap = {};
        retRows.forEach(it => {
            const style = (it.style_name || it.item_name || "").trim().toLowerCase();
            const color = (it.style_color || it.color || "").trim().toLowerCase();
            const process = (it.process || "").trim().toLowerCase();
            const szData = it.sizes_data ? (typeof it.sizes_data === 'string' ? JSON.parse(it.sizes_data) : it.sizes_data) : {};

            if (Object.keys(szData).length > 0) {
                Object.entries(szData).forEach(([sz, qty]) => {
                    const key = `${process}-${style}-${color}-${sz.toLowerCase()}`;
                    retMap[key] = (retMap[key] || 0) + (parseFloat(qty) || 0);
                });
            } else if (it.size) {
                const key = `${process}-${style}-${color}-${it.size.toLowerCase()}`;
                retMap[key] = (retMap[key] || 0) + (parseFloat(it.pcs) || 0);
            }
        });

        const result = inRows.map(it => {
            const style = (it.style_name || it.item_name || "").trim().toLowerCase();
            const color = (it.style_color || it.color || "").trim().toLowerCase();
            const process = (it.process || "").trim().toLowerCase();
            const szData = it.sizes_data ? (typeof it.sizes_data === 'string' ? JSON.parse(it.sizes_data) : it.sizes_data) : {};

            let balancedPcs = 0;
            const newSzData = {};

            if (Object.keys(szData).length > 0) {
                Object.entries(szData).forEach(([sz, qty]) => {
                    const key = `${process}-${style}-${color}-${sz.toLowerCase()}`;
                    const used = retMap[key] || 0;
                    const bal = Math.max(0, (parseFloat(qty) || 0) - used);
                    newSzData[sz] = bal;
                    balancedPcs += bal;
                    if (used > 0) retMap[key] = Math.max(0, used - (parseFloat(qty) || 0));
                });
            } else if (it.size) {
                const key = `${process}-${style}-${color}-${it.size.toLowerCase()}`;
                const used = retMap[key] || 0;
                balancedPcs = Math.max(0, (parseFloat(it.pcs) || 0) - used);
                if (used > 0) retMap[key] = Math.max(0, used - (parseFloat(it.pcs) || 0));
            }

            return { ...it, balanced_pcs: balancedPcs, sizes_data: newSzData };
        }).filter(r => r.balanced_pcs > 0);

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// New Endpoint for Contractor Wages - Returns all inwarded items for an order
router.get("/for-wages/:order_no", async (req, res) => {
    const { order_no } = req.params;
    try {
        const sql = `SELECT h.inward_no, h.inward_date, h.process, h.work_type, h.contractor_name as header_contractor, h.order_name,
                             i.style_name, i.item_name, i.color, i.style_color, i.contractor_name, i.pcs
                      FROM pcs_inward_items i
                      JOIN pcs_inward h ON i.inward_id = h.id
                      WHERE h.order_no = ? AND h.work_type = 'Contractor' AND h.year_id = ?`;
        const yearId = req.headers['x-year-id'];
        const [rows] = await db.promise().query(sql, [order_no, yearId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Alias for frontend compatibility in Pcs Outward
router.get("/order-process-items", async (req, res) => {
    const { order_no, process } = req.query;
    if (!order_no || !process) return res.status(400).json({ error: "Missing order_no or process" });

    try {
        const inItemsSql = `SELECT i.*, h.party_name, h.ship_to, h.process, h.size_chart_name, h.work_type, h.contractor_name as header_contractor 
                           FROM pcs_inward_items i
                           JOIN pcs_inward h ON i.inward_id = h.id
                           WHERE h.order_no = ? AND h.process = ? AND h.year_id = ?`;

        const retItemsSql = `SELECT i.*, h.process FROM pcs_return_items i 
                            JOIN pcs_return h ON i.return_id = h.id 
                            WHERE h.order_no = ? AND h.year_id = ?`;

        const outItemsSql = `SELECT i.*, h.previous_process FROM pcs_outward_items i
                            JOIN pcs_outward h ON i.outward_id = h.id
                            WHERE h.order_no = ? AND h.year_id = ?`;

        const yearId = req.headers['x-year-id'];
        const [inRows] = await db.promise().query(inItemsSql, [order_no, process, yearId]);
        const [retRows] = await db.promise().query(retItemsSql, [order_no, yearId]);
        const [outRows] = await db.promise().query(outItemsSql, [order_no, yearId]);

        // Map consumption quantities (pcs)
        const consumedMap = {}; // key: process-style-color-size

        // 1. Returns
        retRows.forEach(it => {
            const style = (it.style_name || it.item_name || "").trim().toLowerCase();
            const color = (it.style_color || it.color || "").trim().toLowerCase();
            const proc = (it.process || "").trim().toLowerCase();
            const szData = it.sizes_data ? (typeof it.sizes_data === 'string' ? JSON.parse(it.sizes_data) : it.sizes_data) : {};

            if (Object.keys(szData).length > 0) {
                Object.entries(szData).forEach(([sz, qty]) => {
                    const key = `${proc}-${style}-${color}-${sz.toLowerCase()}`;
                    consumedMap[key] = (consumedMap[key] || 0) + (parseFloat(qty) || 0);
                });
            } else if (it.size) {
                const key = `${proc}-${style}-${color}-${it.size.toLowerCase()}`;
                consumedMap[key] = (consumedMap[key] || 0) + (parseFloat(it.pcs) || 0);
            }
        });

        // 2. Outwards (consume previous_process)
        outRows.forEach(it => {
            if (!it.previous_process) return;
            const style = (it.style_name || it.item_name || "").trim().toLowerCase();
            const color = (it.style_color || it.color || "").trim().toLowerCase();
            const prevProc = (it.previous_process || "").trim().toLowerCase();
            const szData = it.sizes_data ? (typeof it.sizes_data === 'string' ? JSON.parse(it.sizes_data) : it.sizes_data) : {};

            if (Object.keys(szData).length > 0) {
                Object.entries(szData).forEach(([sz, qty]) => {
                    const key = `${prevProc}-${style}-${color}-${sz.toLowerCase()}`;
                    consumedMap[key] = (consumedMap[key] || 0) + (parseFloat(qty) || 0);
                });
            } else if (it.size) {
                const key = `${prevProc}-${style}-${color}-${it.size.toLowerCase()}`;
                consumedMap[key] = (consumedMap[key] || 0) + (parseFloat(it.pcs) || 0);
            }
        });

        // Calculate balances
        const result = inRows.map(it => {
            const style = (it.style_name || it.item_name || "").trim().toLowerCase();
            const color = (it.style_color || it.color || "").trim().toLowerCase();
            const proc = (it.process || "").trim().toLowerCase();
            const szData = it.sizes_data ? (typeof it.sizes_data === 'string' ? JSON.parse(it.sizes_data) : it.sizes_data) : {};

            let balancedPcs = 0;
            const newSzData = {};

            if (Object.keys(szData).length > 0) {
                Object.entries(szData).forEach(([sz, qty]) => {
                    const key = `${proc}-${style}-${color}-${sz.toLowerCase()}`;
                    const used = consumedMap[key] || 0;
                    const bal = Math.max(0, (parseFloat(qty) || 0) - used);
                    newSzData[sz] = bal;
                    balancedPcs += bal;
                    if (used > 0) consumedMap[key] = Math.max(0, used - (parseFloat(qty) || 0));
                });
            } else if (it.size) {
                const key = `${proc}-${style}-${color}-${it.size.toLowerCase()}`;
                const used = consumedMap[key] || 0;
                balancedPcs = Math.max(0, (parseFloat(it.pcs) || 0) - used);
                if (used > 0) consumedMap[key] = Math.max(0, used - (parseFloat(it.pcs) || 0));
            }

            return { ...it, balanced_pcs: balancedPcs, sizes_data: newSzData };
        }).filter(r => r.balanced_pcs > 0);

        res.json(result);
    } catch (err) {
        console.error("pcs_inward order-process-items error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", (req, res) => {
    db.query("SELECT * FROM pcs_inward WHERE id = ?", [req.params.id], (err, rows) => {
        if (err || !rows.length) return res.status(404).json({ error: "Not found" });
        const record = rows[0];
        db.query("SELECT * FROM pcs_inward_items WHERE inward_id = ?", [req.params.id], (err, items) => {
            record.items = items || [];
            res.json(record);
        });
    });
});

router.put("/:id", (req, res) => {
    const { inward_date, ref_no, order_no, order_name, party_name, ship_to, process, size_chart_name, work_type = 'Jobwork', contractor_name, remarks, staff_name, staff_remarks, total_pcs, items } = req.body;
    const sql = `UPDATE pcs_inward SET inward_date=?, ref_no=?, order_no=?, order_name=?, party_name=?, ship_to=?, process=?, size_chart_name=?, work_type=?, contractor_name=?, remarks=?, staff_name=?, staff_remarks=?, total_pcs=? WHERE id=?`;
    db.query(sql, [inward_date, ref_no, order_no, order_name, party_name, ship_to, process, size_chart_name, work_type, contractor_name, remarks, staff_name, staff_remarks, total_pcs, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query("DELETE FROM pcs_inward_items WHERE inward_id = ?", [req.params.id], () => {
            if (items && items.length) {
                const itemData = items.map(it => [req.params.id, it.item_name, it.style_name, it.color, it.style_color, it.size, it.contractor_name, it.pcs, JSON.stringify(it.sizes_data || {})]);
                db.query("INSERT INTO pcs_inward_items (inward_id, item_name, style_name, color, style_color, size, contractor_name, pcs, sizes_data) VALUES ?", [itemData], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true });
                });
            } else res.json({ success: true });
        });
    });
});

router.delete("/:id", (req, res) => {
    db.query("DELETE FROM pcs_inward WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

export default router;
