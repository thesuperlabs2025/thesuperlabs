import express from "express";
import db from "../db.js";

const router = express.Router();

// GET all Yarn POs
router.get("/", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const q = `
        SELECT yp.*, 
        (SELECT SUM(qty) FROM yarn_po_items WHERE po_id = yp.id) as total_qty,
        (SELECT SUM(gi.qty) FROM yarn_grn_items gi JOIN yarn_grn g ON g.id = gi.grn_id WHERE g.po_no = yp.po_no) as received_qty
        FROM yarn_po yp 
        WHERE yp.year_id = ?
        ORDER BY yp.id DESC`;
    db.query(q, [yearId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    });
});

// GET single Yarn PO
router.get("/:id", (req, res) => {
    const q = "SELECT * FROM yarn_po WHERE id = ?";
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Not found");

        const po = data[0];
        const qItems = `
            SELECT pi.*, 
            (SELECT COALESCE(SUM(gi.qty), 0) 
             FROM yarn_grn_items gi 
             JOIN yarn_grn g ON g.id = gi.grn_id 
             WHERE g.po_no = ? 
             AND gi.counts <=> pi.counts 
             AND gi.yarn_name <=> pi.yarn_name 
             AND gi.color <=> pi.color) as received_qty
            FROM yarn_po_items pi WHERE pi.po_id = ?`;
        db.query(qItems, [po.po_no, po.id], (err, items) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json({ ...po, items });
        });
    });
});

// GET Next PO NO
router.get("/next-no/gen", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const q = "SELECT po_no FROM yarn_po WHERE year_id = ? ORDER BY id DESC LIMIT 1";
    db.query(q, [yearId], (err, data) => {
        if (err) return res.status(500).json(err);
        let nextNo = "YPO-0001";
        if (data && data.length > 0) {
            const lastNo = data[0].po_no;
            const numPart = lastNo.split("-")[1];
            const num = parseInt(numPart) + 1;
            nextNo = "YPO-" + String(isNaN(num) ? 1 : num).padStart(4, "0");
        }
        res.status(200).json({ po_no: nextNo });
    });
});

// POST Create Yarn PO
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

    const q = "INSERT INTO yarn_po (po_no, supplier_name, ship_to, create_date, staff_name, is_order_specific, is_lot_specific, order_id, order_no, order_name, lot_no, lot_name, is_igst, round_off, remarks, year_id) VALUES (?)";
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
            const qItems = "INSERT INTO yarn_po_items (po_id, counts, yarn_name, yarn_sku, color, per_bag, per_bag_qty, qty, rate, gst_per, total) VALUES ?";
            const itemValues = items.map(item => [
                poId, item.counts, item.yarn_name, item.yarn_sku, item.color, item.per_bag, item.per_bag_qty, item.qty, item.rate || 0, item.gst_per || 0, item.total || 0
            ]);
            db.query(qItems, [itemValues], (err, result) => {
                if (err) return res.status(500).json(err);
                return res.status(200).json({ message: "Yarn PO created", id: poId });
            });
        } else {
            return res.status(200).json({ message: "Yarn PO created (no items)", id: poId });
        }
    });
});

// PUT Update Yarn PO
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

    const q = "UPDATE yarn_po SET supplier_name=?, ship_to=?, create_date=?, staff_name=?, is_order_specific=?, is_lot_specific=?, order_id=?, order_no=?, order_name=?, lot_no=?, lot_name=?, is_igst=?, round_off=?, remarks=? WHERE id=?";
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

        // Delete old items and insert new ones
        const qDelete = "DELETE FROM yarn_po_items WHERE po_id = ?";
        db.query(qDelete, [poId], (err, result) => {
            if (err) return res.status(500).json(err);

            if (items && items.length > 0) {
                const qItems = "INSERT INTO yarn_po_items (po_id, counts, yarn_name, yarn_sku, color, per_bag, per_bag_qty, qty, rate, gst_per, total) VALUES ?";
                const itemValues = items.map(item => [
                    poId, item.counts, item.yarn_name, item.yarn_sku, item.color, item.per_bag, item.per_bag_qty, item.qty, item.rate || 0, item.gst_per || 0, item.total || 0
                ]);
                db.query(qItems, [itemValues], (err, result) => {
                    if (err) return res.status(500).json(err);
                    return res.status(200).json("Yarn PO updated");
                });
            } else {
                return res.status(200).json("Yarn PO updated");
            }
        });
    });
});

// DELETE Yarn PO
router.delete("/:id", (req, res) => {
    const q = "DELETE FROM yarn_po WHERE id = ?";
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Yarn PO deleted");
    });
});

export default router;
