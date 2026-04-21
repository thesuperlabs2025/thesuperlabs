import express from "express";
import db from "../db.js";

const router = express.Router();

// GET all Garments POs
router.get("/", (req, res) => {
    const q = `
        SELECT gp.*, 
        (SELECT SUM(qty) FROM garments_po_items WHERE po_id = gp.id) as total_qty,
        (SELECT SUM(gi.qty) FROM garments_grn_items gi JOIN garments_grn g ON g.id = gi.grn_id WHERE g.po_no = gp.po_no) as received_qty
        FROM garments_po gp ORDER BY gp.id DESC`;
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    });
});

// GET single Garments PO
router.get("/:id", (req, res) => {
    const q = "SELECT * FROM garments_po WHERE id = ?";
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Not found");

        const po = data[0];
        const qItems = `
            SELECT pi.*, 
            (SELECT COALESCE(SUM(gi.qty), 0) 
             FROM garments_grn_items gi 
             JOIN garments_grn g ON g.id = gi.grn_id 
             WHERE g.po_no = ? 
             AND gi.style_name <=> pi.style_name 
             AND gi.color <=> pi.color
             AND gi.size <=> pi.size) as received_qty
            FROM garments_po_items pi WHERE pi.po_id = ?`;
        db.query(qItems, [po.po_no, po.id], (err, items) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json({ ...po, items });
        });
    });
});

// GET Next PO NO
router.get("/next-no/gen", (req, res) => {
    const q = "SELECT po_no FROM garments_po ORDER BY id DESC LIMIT 1";
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        let nextNo = "GPO-0001";
        if (data.length > 0) {
            const lastNo = data[0].po_no;
            const num = parseInt(lastNo.split("-")[1]) + 1;
            nextNo = "GPO-" + String(num).padStart(4, "0");
        }
        res.status(200).json({ po_no: nextNo });
    });
});

// POST Create Garments PO
router.post("/", (req, res) => {
    const {
        po_no, supplier_name, ship_to, create_date, staff_name,
        is_order_specific, is_lot_specific,
        order_id, order_no, order_name,
        lot_no, lot_name,
        is_igst, round_off,
        remarks, items
    } = req.body;

    const q = "INSERT INTO garments_po (po_no, supplier_name, ship_to, create_date, staff_name, is_order_specific, is_lot_specific, order_id, order_no, order_name, lot_no, lot_name, is_igst, round_off, remarks) VALUES (?)";
    const values = [
        po_no, supplier_name, ship_to, create_date, staff_name,
        is_order_specific || 1, is_lot_specific || 0,
        order_id, order_no, order_name,
        lot_no, lot_name,
        is_igst || 0, round_off || 0,
        remarks
    ];

    db.query(q, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        const poId = data.insertId;

        if (items && items.length > 0) {
            const qItems = "INSERT INTO garments_po_items (po_id, style_name, sku, color, size, qty, rate, gst_per, total) VALUES ?";
            const itemValues = items.map(item => [
                poId, item.style_name, item.sku, item.color, item.size, item.qty, item.rate || 0, item.gst_per || 0, item.total || 0
            ]);
            db.query(qItems, [itemValues], (err, result) => {
                if (err) return res.status(500).json(err);
                return res.status(200).json({ message: "Garments PO created", id: poId });
            });
        } else {
            return res.status(200).json({ message: "Garments PO created (no items)", id: poId });
        }
    });
});

// PUT Update Garments PO
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

    const q = "UPDATE garments_po SET supplier_name=?, ship_to=?, create_date=?, staff_name=?, is_order_specific=?, is_lot_specific=?, order_id=?, order_no=?, order_name=?, lot_no=?, lot_name=?, is_igst=?, round_off=?, remarks=? WHERE id=?";
    const values = [
        supplier_name, ship_to, create_date, staff_name,
        is_order_specific || 1, is_lot_specific || 0,
        order_id, order_no, order_name,
        lot_no, lot_name,
        is_igst || 0, round_off || 0,
        remarks, poId
    ];

    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);

        const qDelete = "DELETE FROM garments_po_items WHERE po_id = ?";
        db.query(qDelete, [poId], (err, result) => {
            if (err) return res.status(500).json(err);

            if (items && items.length > 0) {
                const qItems = "INSERT INTO garments_po_items (po_id, style_name, sku, color, size, qty, rate, gst_per, total) VALUES ?";
                const itemValues = items.map(item => [
                    poId, item.style_name, item.sku, item.color, item.size, item.qty, item.rate || 0, item.gst_per || 0, item.total || 0
                ]);
                db.query(qItems, [itemValues], (err, result) => {
                    if (err) return res.status(500).json(err);
                    return res.status(200).json("Garments PO updated");
                });
            } else {
                return res.status(200).json("Garments PO updated");
            }
        });
    });
});

// DELETE Garments PO
router.delete("/:id", (req, res) => {
    const q = "DELETE FROM garments_po WHERE id = ?";
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Garments PO deleted");
    });
});

export default router;
