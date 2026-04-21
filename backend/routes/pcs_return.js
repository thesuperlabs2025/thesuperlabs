import express from "express";
import db from "../db.js";

const router = express.Router();

// ─── Auto-create table if not exists ─────────────────────────────────────────
db.query(`CREATE TABLE IF NOT EXISTS pcs_return (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_no VARCHAR(30) NOT NULL,
    return_type ENUM('order') NOT NULL DEFAULT 'order',
    return_date DATE,
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
    db.query("ALTER TABLE pcs_return ADD COLUMN ship_to VARCHAR(200) AFTER party_name", () => { });
    db.query("ALTER TABLE pcs_return ADD COLUMN size_chart_name VARCHAR(100) AFTER process", () => { });
    db.query("ALTER TABLE pcs_return ADD COLUMN work_type ENUM('Jobwork', 'Contractor') DEFAULT 'Jobwork' AFTER return_type", () => { });
    db.query("ALTER TABLE pcs_return ADD COLUMN contractor_name VARCHAR(255) AFTER work_type", () => { });
});

db.query(`CREATE TABLE IF NOT EXISTS pcs_return_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_id INT NOT NULL,
    item_name VARCHAR(255),
    style_name VARCHAR(255),
    color VARCHAR(100),
    style_color VARCHAR(100),
    size VARCHAR(50),
    pcs INT DEFAULT 0,
    FOREIGN KEY (return_id) REFERENCES pcs_return(id) ON DELETE CASCADE
)`, () => {
    db.query("ALTER TABLE pcs_return_items ADD COLUMN style_name VARCHAR(255) AFTER item_name", () => { });
    db.query("ALTER TABLE pcs_return_items ADD COLUMN style_color VARCHAR(100) AFTER color", () => { });
    db.query("ALTER TABLE pcs_return_items ADD COLUMN sizes_data JSON AFTER pcs", () => { });
    db.query("ALTER TABLE pcs_return_items ADD COLUMN contractor_name VARCHAR(255) AFTER size", () => { });
});


// ─── Helper: next return number ────────────────────────────────────────────
function nextReturnNo(yearId, cb) {
    db.query(
        "SELECT return_no FROM pcs_return WHERE return_type = 'order' AND year_id = ? ORDER BY id DESC LIMIT 1",
        [yearId],
        (err, rows) => {
            if (err || !rows.length) return cb(null, "PCS-RET-0001");
            const last = rows[0].return_no || "";
            const parts = last.split("-");
            const num = parseInt(parts[parts.length - 1], 10) || 0;
            const next = "PCS-RET-" + String(num + 1).padStart(4, "0");
            cb(null, next);
        }
    );
}

router.get("/next-no/order", (req, res) => {
    const yearId = req.headers['x-year-id'];
    nextReturnNo(yearId, (err, no) => res.json({ return_no: no }));
});

// ─── CRUD ──────────────────────────────────────────────────────────────────
router.post("/", (req, res) => {
    const { return_date, ref_no, order_no, order_name, party_name, ship_to, process, size_chart_name, work_type = 'Jobwork', contractor_name, remarks, staff_name, staff_remarks, total_pcs, items } = req.body;
    const yearId = req.headers['x-year-id'];
    nextReturnNo(yearId, (err, no) => {
        const sql = `INSERT INTO pcs_return (return_no, return_type, work_type, contractor_name, return_date, ref_no, order_no, order_name, party_name, ship_to, process, size_chart_name, remarks, staff_name, staff_remarks, total_pcs, year_id) VALUES (?, 'order', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(sql, [no, work_type, contractor_name, return_date, ref_no, order_no, order_name, party_name, ship_to, process, size_chart_name, remarks, staff_name, staff_remarks, total_pcs, yearId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            const return_id = result.insertId;
            if (items && items.length) {
                const itemData = items.map(it => [return_id, it.item_name, it.style_name, it.color, it.style_color, it.size, it.contractor_name, it.pcs, JSON.stringify(it.sizes_data || {})]);
                db.query("INSERT INTO pcs_return_items (return_id, item_name, style_name, color, style_color, size, contractor_name, pcs, sizes_data) VALUES ?", [itemData], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ id: return_id, return_no: no });
                });
            } else {
                res.json({ id: return_id, return_no: no });
            }
        });
    });
});

router.get("/", (req, res) => {
    const { from_date, to_date } = req.query;
    const yearId = req.headers['x-year-id'];
    let sql = "SELECT * FROM pcs_return WHERE return_type = 'order' AND year_id = ?";
    const params = [yearId];
    if (from_date && to_date) {
        sql += " AND return_date BETWEEN ? AND ?";
        params.push(from_date, to_date);
    }
    sql += " ORDER BY id DESC";
    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.get("/:id", (req, res) => {
    db.query("SELECT * FROM pcs_return WHERE id = ?", [req.params.id], (err, rows) => {
        if (err || !rows.length) return res.status(404).json({ error: "Not found" });
        const record = rows[0];
        db.query("SELECT * FROM pcs_return_items WHERE return_id = ?", [req.params.id], (err, items) => {
            record.items = items || [];
            res.json(record);
        });
    });
});

router.put("/:id", (req, res) => {
    const { return_date, ref_no, order_no, order_name, party_name, ship_to, process, size_chart_name, work_type = 'Jobwork', contractor_name, remarks, staff_name, staff_remarks, total_pcs, items } = req.body;
    const sql = `UPDATE pcs_return SET return_date=?, ref_no=?, order_no=?, order_name=?, party_name=?, ship_to=?, process=?, size_chart_name=?, work_type=?, contractor_name=?, remarks=?, staff_name=?, staff_remarks=?, total_pcs=? WHERE id=?`;
    db.query(sql, [return_date, ref_no, order_no, order_name, party_name, ship_to, process, size_chart_name, work_type, contractor_name, remarks, staff_name, staff_remarks, total_pcs, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query("DELETE FROM pcs_return_items WHERE return_id = ?", [req.params.id], () => {
            if (items && items.length) {
                const itemData = items.map(it => [req.params.id, it.item_name, it.style_name, it.color, it.style_color, it.size, it.contractor_name, it.pcs, JSON.stringify(it.sizes_data || {})]);
                db.query("INSERT INTO pcs_return_items (return_id, item_name, style_name, color, style_color, size, contractor_name, pcs, sizes_data) VALUES ?", [itemData], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true });
                });
            } else res.json({ success: true });
        });
    });
});

router.delete("/:id", (req, res) => {
    db.query("DELETE FROM pcs_return WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

export default router;
