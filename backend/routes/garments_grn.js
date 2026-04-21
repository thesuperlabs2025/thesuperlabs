
import express from "express";
import db from "../db.js";

const router = express.Router();

// Get All
router.get("/", (req, res) => {
    const q = "SELECT g.*, (SELECT COALESCE(SUM(qty), 0) FROM garments_grn_items WHERE grn_id = g.id) as total_qty FROM garments_grn g ORDER BY g.id DESC";
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    });
});

// Get One
router.get("/:id", (req, res) => {
    const q = "SELECT * FROM garments_grn WHERE id = ?";
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("GRN not found");

        const grn = data[0];
        const qItems = "SELECT * FROM garments_grn_items WHERE grn_id = ?";
        db.query(qItems, [req.params.id], (err, items) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json({ ...grn, items });
        });
    });
});

// Generate Next
router.get("/next-no/gen", (req, res) => {
    const q = "SELECT grn_no FROM garments_grn ORDER BY id DESC LIMIT 1";
    db.query(q, (err, data) => {
        if (err) return res.json(err);
        let nextNo = "GGRN-0001";
        if (data.length > 0) {
            const lastNo = data[0].grn_no;
            const numPart = parseInt(lastNo.split('-')[1]);
            nextNo = `GGRN-${String(numPart + 1).padStart(4, '0')}`;
        }
        return res.json({ grn_no: nextNo });
    });
});

// Create
router.post("/", (req, res) => {
    const { grn_no, supplier_name, grn_date, dc_no, staff_name, order_id, order_no, order_name, po_no, remarks, items } = req.body;

    // Note: Garments usually order specific, no lot
    const q = "INSERT INTO garments_grn (grn_no, supplier_name, grn_date, dc_no, staff_name, order_id, order_no, order_name, po_no, remarks) VALUES (?)";
    const values = [grn_no, supplier_name, grn_date, dc_no, staff_name, order_id, order_no, order_name, po_no, remarks];

    db.query(q, [values], (err, result) => {
        if (err) return res.status(500).json(err);
        const grnId = result.insertId;

        if (items && items.length > 0) {
            const qItems = "INSERT INTO garments_grn_items (grn_id, style_name, sku, color, size, qty) VALUES ?";
            const itemValues = items.map(item => [grnId, item.style_name, item.sku, item.color, item.size, item.qty]);
            db.query(qItems, [itemValues], (err, result) => {
                if (err) return res.status(500).json(err);
                return res.status(200).json("Garments GRN created successfully");
            });
        } else {
            return res.status(200).json("Garments GRN created successfully");
        }
    });
});

// Update
router.put("/:id", (req, res) => {
    const grnId = req.params.id;
    const { supplier_name, grn_date, dc_no, staff_name, order_id, order_no, order_name, po_no, remarks, items } = req.body;

    const q = "UPDATE garments_grn SET supplier_name=?, grn_date=?, dc_no=?, staff_name=?, order_id=?, order_no=?, order_name=?, po_no=?, remarks=? WHERE id=?";
    const values = [supplier_name, grn_date, dc_no, staff_name, order_id, order_no, order_name, po_no, remarks, grnId];

    db.query(q, values, (err, result) => {
        if (err) return res.status(500).json(err);

        const qDelete = "DELETE FROM garments_grn_items WHERE grn_id = ?";
        db.query(qDelete, [grnId], (err, result) => {
            if (err) return res.status(500).json(err);

            if (items && items.length > 0) {
                const qItems = "INSERT INTO garments_grn_items (grn_id, style_name, sku, color, size, qty) VALUES ?";
                const itemValues = items.map(item => [grnId, item.style_name, item.sku, item.color, item.size, item.qty]);
                db.query(qItems, [itemValues], (err, result) => {
                    if (err) return res.status(500).json(err);
                    return res.status(200).json("Garments GRN updated successfully");
                });
            } else {
                return res.status(200).json("Garments GRN updated successfully");
            }
        });
    });
});

// Delete
router.delete("/:id", (req, res) => {
    const q = "DELETE FROM garments_grn WHERE id = ?";
    db.query(q, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Garments GRN deleted successfully");
    });
});

export default router;
