
import express from "express";
import db from "../db.js";

const router = express.Router();

// Get All
router.get("/", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const q = "SELECT g.*, (SELECT COALESCE(SUM(qty), 0) FROM trims_grn_items WHERE grn_id = g.id) as total_qty FROM trims_grn g WHERE g.year_id = ? ORDER BY g.id DESC";
    db.query(q, [yearId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    });
});

// Get One
router.get("/:id", (req, res) => {
    const q = "SELECT * FROM trims_grn WHERE id = ?";
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("GRN not found");

        const grn = data[0];
        const qItems = "SELECT * FROM trims_grn_items WHERE grn_id = ?";
        db.query(qItems, [req.params.id], (err, items) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json({ ...grn, items });
        });
    });
});

// Generate Next
router.get("/next-no/gen", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const q = "SELECT grn_no FROM trims_grn WHERE year_id = ? ORDER BY id DESC LIMIT 1";
    db.query(q, [yearId], (err, data) => {
        if (err) return res.json(err);
        let nextNo = "TGRN-0001";
        if (data && data.length > 0) {
            const lastNo = data[0].grn_no;
            const numPart = parseInt(lastNo.split('-')[1]);
            nextNo = `TGRN-${String(numPart + 1).padStart(4, '0')}`;
        }
        return res.json({ grn_no: nextNo });
    });
});

// Create
router.post("/", (req, res) => {
    const { grn_no, supplier_name, grn_date, dc_no, staff_name, is_order_specific, is_lot_specific, order_id, order_no, order_name, lot_no, lot_name, po_no, remarks, items } = req.body;
    const yearId = req.headers['x-year-id'];

    const q = "INSERT INTO trims_grn (grn_no, supplier_name, grn_date, dc_no, staff_name, is_order_specific, is_lot_specific, order_id, order_no, order_name, lot_no, lot_name, po_no, remarks, year_id) VALUES (?)";
    const values = [grn_no, supplier_name, grn_date, dc_no, staff_name, is_order_specific, is_lot_specific, order_id, order_no, order_name, lot_no, lot_name, po_no, remarks, yearId];

    db.query(q, [values], (err, result) => {
        if (err) return res.status(500).json(err);
        const grnId = result.insertId;

        if (items && items.length > 0) {
            const qItems = "INSERT INTO trims_grn_items (grn_id, trims_name, trims_sku, color, size, qty) VALUES ?";
            const itemValues = items.map(item => [grnId, item.trims_name, item.trims_sku, item.color, item.size, item.qty]);
            db.query(qItems, [itemValues], (err, result) => {
                if (err) return res.status(500).json(err);
                items.forEach(item => {
                    const sku = item.trims_sku || item.trims_name;
                    const qty = parseFloat(item.qty) || 0;
                    if (sku && qty > 0) {
                        db.query("UPDATE trims SET current_stock = IFNULL(current_stock, 0) + ? WHERE trims_sku = ? OR trims_name = ?", [qty, sku, item.trims_name || sku], (err) => {
                            if (err) console.error("Trims stock update error", err);
                        });
                    }
                });
                return res.status(200).json("Trims GRN created successfully");
            });
        } else {
            return res.status(200).json("Trims GRN created successfully");
        }
    });
});

// Update
router.put("/:id", (req, res) => {
    const grnId = req.params.id;
    const { supplier_name, grn_date, dc_no, staff_name, is_order_specific, is_lot_specific, order_id, order_no, order_name, lot_no, lot_name, po_no, remarks, items } = req.body;

    const q = "UPDATE trims_grn SET supplier_name=?, grn_date=?, dc_no=?, staff_name=?, is_order_specific=?, is_lot_specific=?, order_id=?, order_no=?, order_name=?, lot_no=?, lot_name=?, po_no=?, remarks=? WHERE id=?";
    const values = [supplier_name, grn_date, dc_no, staff_name, is_order_specific, is_lot_specific, order_id, order_no, order_name, lot_no, lot_name, po_no, remarks, grnId];

    db.query(q, values, (err, result) => {
        if (err) return res.status(500).json(err);

        db.query("SELECT * FROM trims_grn_items WHERE grn_id = ?", [grnId], (err, oldItems) => {
            if (err) return res.status(500).json(err);

            oldItems.forEach(item => {
                const sku = item.trims_sku || item.trims_name;
                const qty = parseFloat(item.qty) || 0;
                if (sku && qty > 0) {
                    db.query("UPDATE trims SET current_stock = GREATEST(IFNULL(current_stock, 0) - ?, 0) WHERE trims_sku = ? OR trims_name = ?", [qty, sku, item.trims_name || sku], (err) => {
                        if (err) console.error("Trims stock revert error", err);
                    });
                }
            });

            const qDelete = "DELETE FROM trims_grn_items WHERE grn_id = ?";
            db.query(qDelete, [grnId], (err, result) => {
                if (err) return res.status(500).json(err);

                if (items && items.length > 0) {
                    const qItems = "INSERT INTO trims_grn_items (grn_id, trims_name, trims_sku, color, size, qty) VALUES ?";
                    const itemValues = items.map(item => [grnId, item.trims_name, item.trims_sku, item.color, item.size, item.qty]);
                    db.query(qItems, [itemValues], (err, result) => {
                        if (err) return res.status(500).json(err);
                        items.forEach(item => {
                            const sku = item.trims_sku || item.trims_name;
                            const qty = parseFloat(item.qty) || 0;
                            if (sku && qty > 0) {
                                db.query("UPDATE trims SET current_stock = IFNULL(current_stock, 0) + ? WHERE trims_sku = ? OR trims_name = ?", [qty, sku, item.trims_name || sku], (err) => {
                                    if (err) console.error("Trims stock update error", err);
                                });
                            }
                        });
                        return res.status(200).json("Trims GRN updated successfully");
                    });
                } else {
                    return res.status(200).json("Trims GRN updated successfully");
                }
            });
        });
    });
});

// Delete
router.delete("/:id", (req, res) => {
    const grnId = req.params.id;
    db.query("SELECT * FROM trims_grn_items WHERE grn_id = ?", [grnId], (err, oldItems) => {
        if (err) return res.status(500).json(err);
        oldItems.forEach(item => {
            const sku = item.trims_sku || item.trims_name;
            const qty = parseFloat(item.qty) || 0;
            if (sku && qty > 0) {
                db.query("UPDATE trims SET current_stock = GREATEST(IFNULL(current_stock, 0) - ?, 0) WHERE trims_sku = ? OR trims_name = ?", [qty, sku, item.trims_name || sku], (err) => {
                    if (err) console.error("Trims stock revert on delete", err);
                });
            }
        });
        db.query("DELETE FROM trims_grn WHERE id = ?", [grnId], (err, result) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json("Trims GRN deleted successfully");
        });
    });
});

export default router;
