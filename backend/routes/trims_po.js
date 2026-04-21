import express from "express";
import db from "../db.js";

const router = express.Router();

// GET all Trims POs
router.get("/", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const q = `
        SELECT tp.*, 
        (SELECT SUM(qty) FROM trims_po_items WHERE po_id = tp.id) as total_qty,
        (SELECT SUM(gi.qty) FROM trims_grn_items gi JOIN trims_grn g ON g.id = gi.grn_id WHERE g.po_no = tp.po_no) as received_qty
        FROM trims_po tp 
        WHERE tp.year_id = ?
        ORDER BY tp.id DESC`;
    db.query(q, [yearId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    });
});

// GET single Trims PO
router.get("/:id", (req, res) => {
    const q = "SELECT * FROM trims_po WHERE id = ?";
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Not found");

        const po = data[0];
        const qItems = `
            SELECT pi.*, 
            (SELECT COALESCE(SUM(gi.qty), 0) 
             FROM trims_grn_items gi 
             JOIN trims_grn g ON g.id = gi.grn_id 
             WHERE g.po_no = ? 
             AND gi.trims_name <=> pi.trims_name 
             AND gi.color <=> pi.color
             AND gi.size <=> pi.size) as received_qty
            FROM trims_po_items pi WHERE pi.po_id = ?`;
        db.query(qItems, [po.po_no, po.id], (err, items) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json({ ...po, items });
        });
    });
});

// GET Next PO NO
router.get("/next-no/gen", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const q = "SELECT po_no FROM trims_po WHERE year_id = ? ORDER BY id DESC LIMIT 1";
    db.query(q, [yearId], (err, data) => {
        if (err) return res.status(500).json(err);
        let nextNo = "TPO-0001";
        if (data && data.length > 0) {
            const lastNo = data[0].po_no;
            const numPart = lastNo.split("-")[1];
            const num = parseInt(numPart) + 1;
            nextNo = "TPO-" + String(isNaN(num) ? 1 : num).padStart(4, "0");
        }
        res.status(200).json({ po_no: nextNo });
    });
});

// POST Create Trims PO
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

    const q = "INSERT INTO trims_po (po_no, supplier_name, ship_to, create_date, staff_name, is_order_specific, is_lot_specific, order_id, order_no, order_name, lot_no, lot_name, is_igst, round_off, remarks, year_id) VALUES (?)";
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
            const qItems = "INSERT INTO trims_po_items (po_id, trims_name, trims_sku, color, size, qty, rate, gst_per, total) VALUES ?";
            const itemValues = items.map(item => [
                poId, item.trims_name, item.trims_sku, item.color, item.size, item.qty, item.rate || 0, item.gst_per || 0, item.total || 0
            ]);
            db.query(qItems, [itemValues], (err, result) => {
                if (err) return res.status(500).json(err);
                return res.status(200).json({ message: "Trims PO created", id: poId });
            });
        } else {
            return res.status(200).json({ message: "Trims PO created (no items)", id: poId });
        }
    });
});

// PUT Update Trims PO
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

    const q = "UPDATE trims_po SET supplier_name=?, ship_to=?, create_date=?, staff_name=?, is_order_specific=?, is_lot_specific=?, order_id=?, order_no=?, order_name=?, lot_no=?, lot_name=?, is_igst=?, round_off=?, remarks=? WHERE id=?";
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

        const qDelete = "DELETE FROM trims_po_items WHERE po_id = ?";
        db.query(qDelete, [poId], (err, result) => {
            if (err) return res.status(500).json(err);

            if (items && items.length > 0) {
                const qItems = "INSERT INTO trims_po_items (po_id, trims_name, trims_sku, color, size, qty, rate, gst_per, total) VALUES ?";
                const itemValues = items.map(item => [
                    poId, item.trims_name, item.trims_sku, item.color, item.size, item.qty, item.rate || 0, item.gst_per || 0, item.total || 0
                ]);
                db.query(qItems, [itemValues], (err, result) => {
                    if (err) return res.status(500).json(err);
                    return res.status(200).json("Trims PO updated");
                });
            } else {
                return res.status(200).json("Trims PO updated");
            }
        });
    });
});

// DELETE Trims PO
router.delete("/:id", (req, res) => {
    const q = "DELETE FROM trims_po WHERE id = ?";
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Trims PO deleted");
    });
});

export default router;
