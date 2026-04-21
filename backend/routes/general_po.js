import express from "express";
import db from "../db.js";

const router = express.Router();

// GET all General POs
router.get("/", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const q = `
        SELECT gp.*, 
        (SELECT SUM(qty) FROM general_po_items WHERE po_id = gp.id) as total_qty,
        (SELECT SUM(gi.qty) FROM general_grn_items gi JOIN general_grn g ON g.id = gi.grn_id WHERE g.po_no = gp.po_no) as received_qty
        FROM general_po gp 
        WHERE gp.year_id = ?
        ORDER BY gp.id DESC`;
    db.query(q, [yearId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    });
});

// GET single General PO
router.get("/:id", (req, res) => {
    const q = "SELECT * FROM general_po WHERE id = ?";
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Not found");

        const po = data[0];
        const qItems = `
            SELECT pi.*, 
            (SELECT COALESCE(SUM(gi.qty), 0) 
             FROM general_grn_items gi 
             JOIN general_grn g ON g.id = gi.grn_id 
             WHERE g.po_no = ? 
             AND gi.counts <=> pi.counts 
             AND gi.yarn_name <=> pi.yarn_name 
             AND gi.fabric_name <=> pi.fabric_name 
             AND gi.trims_name <=> pi.trims_name 
             AND gi.color <=> pi.color
             AND gi.size <=> pi.size) as received_qty
            FROM general_po_items pi WHERE pi.po_id = ?`;
        db.query(qItems, [po.po_no, po.id], (err, items) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json({ ...po, items });
        });
    });
});

// GET Next PO NO
router.get("/next-no/gen", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const q = "SELECT po_no FROM general_po WHERE year_id = ? ORDER BY id DESC LIMIT 1";
    db.query(q, [yearId], (err, data) => {
        if (err) return res.status(500).json(err);
        let nextNo = "GNPO-0001";
        if (data && data.length > 0) {
            const lastNo = data[0].po_no;
            const numPart = (lastNo.split("-")[1]);
            const num = parseInt(numPart) + 1;
            nextNo = "GNPO-" + String(isNaN(num) ? 1 : num).padStart(4, "0");
        }
        res.status(200).json({ po_no: nextNo });
    });
});

// POST Create General PO
router.post("/", (req, res) => {
    const {
        po_no, supplier_name, ship_to, create_date, staff_name,
        po_type, is_order_specific, is_lot_specific,
        order_id, order_no, order_name,
        lot_no, lot_name,
        is_igst, round_off,
        remarks, items
    } = req.body;

    const yearId = req.headers['x-year-id'];
    const q = "INSERT INTO general_po (po_no, supplier_name, ship_to, create_date, staff_name, po_type, is_order_specific, is_lot_specific, order_id, order_no, order_name, lot_no, lot_name, is_igst, round_off, remarks, year_id) VALUES (?)";
    const values = [
        po_no, supplier_name, ship_to, create_date, staff_name,
        po_type,
        is_order_specific || 0, is_lot_specific || 0,
        order_id || null, order_no || null, order_name || null,
        lot_no || null, lot_name || null,
        is_igst || 0, round_off || 0,
        remarks, yearId
    ];

    db.query(q, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        const poId = data.insertId;

        if (items && items.length > 0) {
            const qItems = "INSERT INTO general_po_items (po_id, counts, yarn_name, fabric_name, trims_name, color, size, gsm, dia, per_bag, per_bag_qty, rolls, qty, rate, gst_per, total) VALUES ?";
            const itemValues = items.map(item => [
                poId,
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
                item.qty,
                item.rate || 0,
                item.gst_per || 0,
                item.total || 0
            ]);
            db.query(qItems, [itemValues], (err, result) => {
                if (err) return res.status(500).json(err);
                return res.status(200).json({ message: "General PO created", id: poId });
            });
        } else {
            return res.status(200).json({ message: "General PO created (no items)", id: poId });
        }
    });
});

// PUT Update General PO
router.put("/:id", (req, res) => {
    const poId = req.params.id;
    const {
        supplier_name, ship_to, create_date, staff_name,
        po_type, is_order_specific, is_lot_specific,
        order_id, order_no, order_name,
        lot_no, lot_name,
        is_igst, round_off,
        remarks, items
    } = req.body;

    const q = "UPDATE general_po SET supplier_name=?, ship_to=?, create_date=?, staff_name=?, po_type=?, is_order_specific=?, is_lot_specific=?, order_id=?, order_no=?, order_name=?, lot_no=?, lot_name=?, is_igst=?, round_off=?, remarks=? WHERE id=?";
    const values = [
        supplier_name, ship_to, create_date, staff_name,
        po_type,
        is_order_specific || 0, is_lot_specific || 0,
        order_id || null, order_no || null, order_name || null,
        lot_no || null, lot_name || null,
        is_igst || 0, round_off || 0,
        remarks, poId
    ];

    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);

        const qDelete = "DELETE FROM general_po_items WHERE po_id = ?";
        db.query(qDelete, [poId], (err, result) => {
            if (err) return res.status(500).json(err);

            if (items && items.length > 0) {
                const qItems = "INSERT INTO general_po_items (po_id, counts, yarn_name, fabric_name, trims_name, color, size, gsm, dia, per_bag, per_bag_qty, rolls, qty, rate, gst_per, total) VALUES ?";
                const itemValues = items.map(item => [
                    poId,
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
                    item.qty,
                    item.rate || 0,
                    item.gst_per || 0,
                    item.total || 0
                ]);
                db.query(qItems, [itemValues], (err, result) => {
                    if (err) return res.status(500).json(err);
                    return res.status(200).json("General PO updated");
                });
            } else {
                return res.status(200).json("General PO updated");
            }
        });
    });
});

// DELETE General PO
router.delete("/:id", (req, res) => {
    const q = "DELETE FROM general_po WHERE id = ?";
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("General PO deleted");
    });
});

export default router;
