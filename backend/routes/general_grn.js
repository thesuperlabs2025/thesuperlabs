
import express from "express";
import db from "../db.js";

const router = express.Router();

// Get All
router.get("/", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const q = "SELECT g.*, (SELECT COALESCE(SUM(qty), 0) FROM general_grn_items WHERE grn_id = g.id) as total_qty FROM general_grn g WHERE g.year_id = ? ORDER BY g.id DESC";
    db.query(q, [yearId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    });
});

// Get One
router.get("/:id", (req, res) => {
    const q = "SELECT * FROM general_grn WHERE id = ?";
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("GRN not found");

        const grn = data[0];
        const qItems = "SELECT * FROM general_grn_items WHERE grn_id = ?";
        db.query(qItems, [req.params.id], (err, items) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json({ ...grn, items });
        });
    });
});

// Generate Next
router.get("/next-no/gen", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const q = "SELECT grn_no FROM general_grn WHERE year_id = ? ORDER BY id DESC LIMIT 1";
    db.query(q, [yearId], (err, data) => {
        if (err) return res.json(err);
        let nextNo = "GENGRN-0001";
        if (data && data.length > 0) {
            const lastNo = data[0].grn_no;
            const numPart = parseInt(lastNo.split('-')[1]);
            nextNo = `GENGRN-${String(numPart + 1).padStart(4, '0')}`;
        }
        return res.json({ grn_no: nextNo });
    });
});

// Create
router.post("/", (req, res) => {
    const { grn_no, supplier_name, grn_date, dc_no, staff_name, grn_type, po_no, remarks, items } = req.body;

    const yearId = req.headers['x-year-id'];
    // General GRN typically simpler header
    const q = "INSERT INTO general_grn (grn_no, supplier_name, grn_date, dc_no, staff_name, grn_type, po_no, remarks, year_id) VALUES (?)";
    const values = [grn_no, supplier_name, grn_date, dc_no, staff_name, grn_type, po_no, remarks, yearId];

    db.query(q, [values], (err, result) => {
        if (err) return res.status(500).json(err);
        const grnId = result.insertId;

        if (items && items.length > 0) {
            // Include all possible columns, some will be null/empty based on type
            const qItems = "INSERT INTO general_grn_items (grn_id, counts, yarn_name, fabric_name, trims_name, color, size, gsm, dia, per_bag, per_bag_qty, rolls, qty) VALUES ?";
            const itemValues = items.map(item => [
                grnId,
                item.counts || null,
                item.yarn_name || null,
                item.fabric_name || null,
                item.trims_name || null,
                item.color || null,
                item.size || null,
                item.gsm || null,
                item.dia || null,
                item.per_bag || null,
                item.per_bag_qty || null,
                item.rolls || null,
                item.qty
            ]);
            db.query(qItems, [itemValues], (err, result) => {
                if (err) return res.status(500).json(err);
                return res.status(200).json("General GRN created successfully");
            });
        } else {
            return res.status(200).json("General GRN created successfully");
        }
    });
});

// Update
router.put("/:id", (req, res) => {
    const grnId = req.params.id;
    const { supplier_name, grn_date, dc_no, staff_name, grn_type, po_no, remarks, items } = req.body;

    const q = "UPDATE general_grn SET supplier_name=?, grn_date=?, dc_no=?, staff_name=?, grn_type=?, po_no=?, remarks=? WHERE id=?";
    const values = [supplier_name, grn_date, dc_no, staff_name, grn_type, po_no, remarks, grnId];

    db.query(q, values, (err, result) => {
        if (err) return res.status(500).json(err);

        const qDelete = "DELETE FROM general_grn_items WHERE grn_id = ?";
        db.query(qDelete, [grnId], (err, result) => {
            if (err) return res.status(500).json(err);

            if (items && items.length > 0) {
                const qItems = "INSERT INTO general_grn_items (grn_id, counts, yarn_name, fabric_name, trims_name, color, size, gsm, dia, per_bag, per_bag_qty, rolls, qty) VALUES ?";
                const itemValues = items.map(item => [
                    grnId,
                    item.counts || null,
                    item.yarn_name || null,
                    item.fabric_name || null,
                    item.trims_name || null,
                    item.color || null,
                    item.size || null,
                    item.gsm || null,
                    item.dia || null,
                    item.per_bag || null,
                    item.per_bag_qty || null,
                    item.rolls || null,
                    item.qty
                ]);
                db.query(qItems, [itemValues], (err, result) => {
                    if (err) return res.status(500).json(err);
                    return res.status(200).json("General GRN updated successfully");
                });
            } else {
                return res.status(200).json("General GRN updated successfully");
            }
        });
    });
});

// Delete
router.delete("/:id", (req, res) => {
    const q = "DELETE FROM general_grn WHERE id = ?";
    db.query(q, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("General GRN deleted successfully");
    });
});

export default router;
