import express from "express";
import db from "../db.js";

const router = express.Router();

const getNextNo = (cb) => {
    db.query("SELECT inward_no FROM trims_direct_inward ORDER BY id DESC LIMIT 1", (err, rows) => {
        if (err) return cb(err);
        let nextNo = "TI-0001";
        if (rows && rows.length > 0) {
            const last = rows[0].inward_no;
            const num = parseInt(last.split("-")[1] || 0) + 1;
            nextNo = `TI-${String(num).padStart(4, "0")}`;
        }
        cb(null, nextNo);
    });
};

router.get("/next-no", (req, res) => {
    getNextNo((err, no) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ inward_no: no });
    });
});

router.get("/", (req, res) => {
    const q = "SELECT * FROM trims_direct_inward ORDER BY id DESC";
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    });
});

router.get("/:id", (req, res) => {
    const q = "SELECT * FROM trims_direct_inward WHERE id = ?";
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Inward not found");

        const inward = data[0];
        const qItems = "SELECT * FROM trims_direct_inward_items WHERE inward_id = ?";
        db.query(qItems, [req.params.id], (err, items) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json({ ...inward, items });
        });
    });
});

router.post("/", (req, res) => {
    const { inward_no, order_no, supplier_name, inward_date, staff_name, remarks, items } = req.body;

    getNextNo((err, nextNo) => {
        const finalNo = inward_no || nextNo;

        const q = "INSERT INTO trims_direct_inward (inward_no, order_no, supplier_name, inward_date, staff_name, remarks) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [finalNo, order_no, supplier_name, inward_date, staff_name, remarks];

        db.query(q, values, (err, result) => {
            if (err) return res.status(500).json(err);
            const inwardId = result.insertId;

            if (items && items.length > 0) {
                const qItems = "INSERT INTO trims_direct_inward_items (inward_id, sku, trims_name, qty) VALUES ?";
                const itemValues = items.map(item => [inwardId, item.sku || item.trims_name, item.trims_name, item.qty]);

                db.query(qItems, [itemValues], (err, result) => {
                    if (err) return res.status(500).json(err);

                    items.forEach(item => {
                        db.query("UPDATE trims SET current_stock = IFNULL(current_stock, 0) + ? WHERE trims_name = ?", [item.qty, item.trims_name], (err) => {
                            if (err) console.error("Stock update error for trims", err);
                        });
                    });

                    return res.status(200).json({ message: "Trims Inward created successfully", id: inwardId });
                });
            } else {
                return res.status(200).json({ message: "Trims Inward created successfully", id: inwardId });
            }
        });
    });
});

// Update
router.put("/:id", (req, res) => {
    const inwardId = req.params.id;
    const { order_no, supplier_name, inward_date, staff_name, remarks, items } = req.body;

    const qOldItems = "SELECT * FROM trims_direct_inward_items WHERE inward_id = ?";
    db.query(qOldItems, [inwardId], (err, oldItems) => {
        if (err) return res.status(500).json(err);

        oldItems.forEach(item => {
            db.query("UPDATE trims SET current_stock = GREATEST(IFNULL(current_stock, 0) - ?, 0) WHERE trims_name = ?", [item.qty, item.trims_name]);
        });

        const qUpdate = "UPDATE trims_direct_inward SET order_no=?, supplier_name=?, inward_date=?, staff_name=?, remarks=? WHERE id=?";
        db.query(qUpdate, [order_no, supplier_name, inward_date, staff_name, remarks, inwardId], (err) => {
            if (err) return res.status(500).json(err);

            db.query("DELETE FROM trims_direct_inward_items WHERE inward_id = ?", [inwardId], (err) => {
                if (err) return res.status(500).json(err);

                if (items && items.length > 0) {
                    const qItems = "INSERT INTO trims_direct_inward_items (inward_id, sku, trims_name, qty) VALUES ?";
                    const itemValues = items.map(item => [inwardId, item.sku || item.trims_name, item.trims_name, item.qty]);

                    db.query(qItems, [itemValues], (err) => {
                        if (err) return res.status(500).json(err);

                        items.forEach(item => {
                            db.query("UPDATE trims SET current_stock = IFNULL(current_stock, 0) + ? WHERE trims_name = ?", [item.qty, item.trims_name]);
                        });

                        return res.status(200).json("Trims Inward updated successfully");
                    });
                } else {
                    return res.status(200).json("Trims Inward updated successfully");
                }
            });
        });
    });
});

router.delete("/:id", (req, res) => {
    const inwardId = req.params.id;
    const qOldItems = "SELECT * FROM trims_direct_inward_items WHERE inward_id = ?";
    db.query(qOldItems, [inwardId], (err, oldItems) => {
        if (err) return res.status(500).json(err);

        oldItems.forEach(item => {
            db.query("UPDATE trims SET current_stock = GREATEST(IFNULL(current_stock, 0) - ?, 0) WHERE trims_name = ?", [item.qty, item.trims_name]);
        });

        const q = "DELETE FROM trims_direct_inward WHERE id = ?";
        db.query(q, [inwardId], (err, result) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json("Trims Inward deleted successfully");
        });
    });
});

export default router;
