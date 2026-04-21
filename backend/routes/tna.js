import express from 'express';
import db from '../db.js';

const router = express.Router();

// 1. Create TNA Record
router.post("/", async (req, res) => {
    const { header, processes } = req.body;
    const connection = await db.promise().getConnection();
    try {
        const yearId = req.headers['x-year-id'];
        await connection.beginTransaction();
        const [hResult] = await connection.query(
            `INSERT INTO tna_headers (order_no, order_name, customer_name, style_name, order_qty, overall_due_date, status, year_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [header.order_no, header.order_name, header.customer_name, header.style_name, header.order_qty, header.overall_due_date, 'In Progress', yearId]
        );

        const tnaId = hResult.insertId;

        for (let i = 0; i < processes.length; i++) {
            const p = processes[i];
            await connection.query(
                `INSERT INTO tna_processes (tna_id, sequence_no, process_name, assigned_member_id, assigned_member_name, due_date, exceptional_days, notes, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [tnaId, i + 1, p.process_name, p.assigned_member_id, p.assigned_member_name, p.due_date, p.exceptional_days || 0, p.notes || '', 'Not Started']
            );
        }

        await connection.commit();
        res.status(201).json({ message: "TNA created successfully", tnaId });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// 2. Get All TNA (Track Page)
router.get("/", async (req, res) => {
    try {
        const yearId = req.headers['x-year-id'];
        const [headers] = await db.promise().query("SELECT * FROM tna_headers WHERE year_id = ? ORDER BY created_at DESC", [yearId]);
        const [processes] = await db.promise().query("SELECT * FROM tna_processes ORDER BY tna_id, sequence_no");
        const combined = headers.map(h => ({
            ...h,
            processes: processes.filter(p => p.tna_id === h.id)
        }));
        res.json(combined);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Get Orders for TNA (with style_name, total_qty and delivery_date from joined tables)
router.get("/orders-for-tna", async (req, res) => {
    try {
        const sql = `
            SELECT 
                op.id,
                op.order_no,
                op.order_name,
                op.buyer_name,
                op.delivery_date,
                COALESCE(sq.style_name, '') as style_name,
                COALESCE(sq.total_qty, 0) as order_qty
            FROM order_planning op
            LEFT JOIN size_quantity sq ON sq.order_id = op.id
            WHERE op.year_id = ?
            ORDER BY op.id DESC
        `;
        const yearId = req.headers['x-year-id'];
        const [rows] = await db.promise().query(sql, [yearId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Get TNA Process Master
router.get("/process-master", async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM tna_process_master ORDER BY sequence_no ASC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get User Specific Tasks (My Page)
router.get("/my-tasks/:user_id", async (req, res) => {
    const { user_id } = req.params;
    try {
        const sql = `
            SELECT p.*, h.order_no, h.order_name, h.customer_name, h.style_name, h.overall_due_date
            FROM tna_processes p
            JOIN tna_headers h ON p.tna_id = h.id
            WHERE p.assigned_member_id = ? AND h.year_id = ?
            ORDER BY p.due_date ASC
        `;
        const yearId = req.headers['x-year-id'];
        const [rows] = await db.promise().query(sql, [user_id, yearId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2.1 Get Single TNA
router.get("/:id", async (req, res) => {
    try {
        const yearId = req.headers['x-year-id'];
        console.log(`Fetching TNA with ID: ${req.params.id}`);
        const [headers] = await db.promise().query("SELECT * FROM tna_headers WHERE id = ? AND year_id = ?", [req.params.id, yearId]);
        if (headers.length === 0) {
            console.log(`TNA not found for ID: ${req.params.id}`);
            return res.status(404).json({ error: "TNA not found" });
        }
        const [processes] = await db.promise().query("SELECT * FROM tna_processes WHERE tna_id = ? ORDER BY sequence_no", [req.params.id]);
        res.json({ ...headers[0], processes });
    } catch (err) {
        console.error(`Error fetching TNA ${req.params.id}:`, err);
        res.status(500).json({ error: err.message });
    }
});

// 4. Update Process Progress (My Page Action)
router.put("/process/:id", async (req, res) => {
    const { id } = req.params;
    const { completed_qty, notes, status, completion_date } = req.body;
    try {
        await db.promise().query(
            `UPDATE tna_processes 
             SET completed_qty = ?, notes = ?, status = ?, completion_date = ? 
             WHERE id = ?`,
            [completed_qty, notes, status, completion_date || null, id]
        );
        res.json({ message: "Progress updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Delete TNA
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.promise().query("DELETE FROM tna_headers WHERE id = ?", [id]);
        res.json({ message: "TNA deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. Add to Process Master
router.post("/process-master", async (req, res) => {
    const { process_name, sequence_no } = req.body;
    try {
        await db.promise().query(
            "INSERT INTO tna_process_master (process_name, sequence_no) VALUES (?, ?)",
            [process_name, sequence_no || 0]
        );
        res.status(201).json({ message: "Process added to master" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9. Update Process Master
router.get("/process-master/:id", async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM tna_process_master WHERE id = ?", [req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/process-master/:id", async (req, res) => {
    const { process_name, sequence_no } = req.body;
    try {
        await db.promise().query(
            "UPDATE tna_process_master SET process_name = ?, sequence_no = ? WHERE id = ?",
            [process_name, sequence_no || 0, req.params.id]
        );
        res.json({ message: "Process updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 10. Delete Process Master
router.delete("/process-master/:id", async (req, res) => {
    try {
        await db.promise().query("DELETE FROM tna_process_master WHERE id = ?", [req.params.id]);
        res.json({ message: "Process deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
