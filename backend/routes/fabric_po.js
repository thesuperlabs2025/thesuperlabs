import express from "express";
import db from "../db.js";

const router = express.Router();

// GET all Fabric POs
router.get("/", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const q = `
        SELECT fp.*, 
        (SELECT SUM(qty) FROM fabric_po_items WHERE po_id = fp.id) as total_qty,
        (SELECT SUM(gi.qty) FROM fabric_grn_items gi JOIN fabric_grn g ON g.id = gi.grn_id WHERE g.po_no = fp.po_no) as received_qty
        FROM fabric_po fp 
        WHERE fp.year_id = ?
        ORDER BY fp.id DESC`;
    db.query(q, [yearId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    });
});

// GET single Fabric PO
router.get("/:id", (req, res) => {
    const q = "SELECT * FROM fabric_po WHERE id = ?";
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Not found");

        const po = data[0];
        const qItems = `
            SELECT pi.*, 
            (SELECT COALESCE(SUM(gi.qty), 0) 
             FROM fabric_grn_items gi 
             JOIN fabric_grn g ON g.id = gi.grn_id 
             WHERE g.po_no = ? 
             AND gi.counts <=> pi.counts 
             AND gi.fabric_name <=> pi.fabric_name 
             AND gi.color <=> pi.color
             AND gi.gsm <=> pi.gsm
             AND gi.dia <=> pi.dia) as received_qty
            FROM fabric_po_items pi WHERE pi.po_id = ?`;
        db.query(qItems, [po.po_no, po.id], (err, items) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json({ ...po, items });
        });
    });
});

// GET Next PO NO
router.get("/next-no/gen", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const q = "SELECT po_no FROM fabric_po WHERE year_id = ? ORDER BY id DESC LIMIT 1";
    db.query(q, [yearId], (err, data) => {
        if (err) return res.status(500).json(err);
        let nextNo = "FPO-0001";
        if (data && data.length > 0) {
            const lastNo = data[0].po_no;
            const num = parseInt(lastNo.split("-")[1]) + 1;
            nextNo = "FPO-" + String(num).padStart(4, "0");
        }
        res.status(200).json({ po_no: nextNo });
    });
});

// POST Create Fabric PO
router.post("/", (req, res) => {
    const {
        po_no, supplier_name, ship_to, create_date, staff_name,
        is_order_specific, is_lot_specific,
        order_id, order_no, order_name,
        lot_no, lot_name,
        is_igst, round_off,
        remarks, items
    } = req.body;

    const yearId = req.headers['x-year-id'];

    const q = "INSERT INTO fabric_po (po_no, supplier_name, ship_to, create_date, staff_name, is_order_specific, is_lot_specific, order_id, order_no, order_name, lot_no, lot_name, is_igst, round_off, remarks, year_id) VALUES (?)";
    const values = [
        po_no, supplier_name, ship_to, create_date, staff_name,
        is_order_specific, is_lot_specific,
        order_id, order_no, order_name,
        lot_no, lot_name,
        is_igst || 0, round_off || 0,
        remarks, yearId
    ];

    db.query(q, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        const poId = data.insertId;

        if (items && items.length > 0) {
            const qItems = "INSERT INTO fabric_po_items (po_id, counts, fabric_name, fabric_sku, color, gsm, dia, rolls, qty, rate, gst_per, total) VALUES ?";
            const itemValues = items.map(item => [
                poId, item.counts, item.fabric_name, item.fabric_sku, item.color, item.gsm, item.dia, item.rolls, item.qty, item.rate || 0, item.gst_per || 0, item.total || 0
            ]);
            db.query(qItems, [itemValues], (err, result) => {
                if (err) return res.status(500).json(err);
                return res.status(200).json({ message: "Fabric PO created", id: poId });
            });
        } else {
            return res.status(200).json({ message: "Fabric PO created (no items)", id: poId });
        }
    });
});

// PUT Update Fabric PO
router.put("/:id", (req, res) => {
    const poId = req.params.id;
    const {
        supplier_name, ship_to, create_date, staff_name,
        is_order_specific, is_lot_specific,
        order_id, order_no, order_name,
        lot_no, lot_name,
        is_igst, round_off,
        remarks, items
    } = req.body;

    const q = "UPDATE fabric_po SET supplier_name=?, ship_to=?, create_date=?, staff_name=?, is_order_specific=?, is_lot_specific=?, order_id=?, order_no=?, order_name=?, lot_no=?, lot_name=?, is_igst=?, round_off=?, remarks=? WHERE id=?";
    const values = [
        supplier_name, ship_to, create_date, staff_name,
        is_order_specific, is_lot_specific,
        order_id, order_no, order_name,
        lot_no, lot_name,
        is_igst || 0, round_off || 0,
        remarks, poId
    ];

    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);

        const qDelete = "DELETE FROM fabric_po_items WHERE po_id = ?";
        db.query(qDelete, [poId], (err, result) => {
            if (err) return res.status(500).json(err);

            if (items && items.length > 0) {
                const qItems = "INSERT INTO fabric_po_items (po_id, counts, fabric_name, fabric_sku, color, gsm, dia, rolls, qty, rate, gst_per, total) VALUES ?";
                const itemValues = items.map(item => [
                    poId, item.counts, item.fabric_name, item.fabric_sku, item.color, item.gsm, item.dia, item.rolls, item.qty, item.rate || 0, item.gst_per || 0, item.total || 0
                ]);
                db.query(qItems, [itemValues], (err, result) => {
                    if (err) return res.status(500).json(err);
                    return res.status(200).json("Fabric PO updated");
                });
            } else {
                return res.status(200).json("Fabric PO updated");
            }
        });
    });
});

// DELETE Fabric PO
router.delete("/:id", (req, res) => {
    const q = "DELETE FROM fabric_po WHERE id = ?";
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Fabric PO deleted");
    });
});

export default router;
