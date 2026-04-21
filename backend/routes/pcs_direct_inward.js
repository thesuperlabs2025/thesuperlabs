import express from "express";
import db from "../db.js";

const router = express.Router();

const getNextNo = (cb) => {
    db.query("SELECT inward_no FROM pcs_direct_inward ORDER BY id DESC LIMIT 1", (err, rows) => {
        if (err) return cb(err);
        let nextNo = "PI-0001";
        if (rows && rows.length > 0) {
            const last = rows[0].inward_no;
            const num = parseInt(last.split("-")[1] || 0) + 1;
            nextNo = `PI-${String(num).padStart(4, "0")}`;
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
    const q = "SELECT * FROM pcs_direct_inward ORDER BY id DESC";
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    });
});

router.get("/:id", (req, res) => {
    const q = "SELECT * FROM pcs_direct_inward WHERE id = ?";
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Inward not found");

        const inward = data[0];
        const qItems = "SELECT * FROM pcs_direct_inward_items WHERE inward_id = ?";
        db.query(qItems, [req.params.id], (err, items) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json({ ...inward, items });
        });
    });
});

router.post("/", (req, res) => {
    const { inward_no, supplier_name, inward_date, staff_name, remarks, items } = req.body;

    getNextNo((err, nextNo) => {
        const finalNo = inward_no || nextNo;

        const q = "INSERT INTO pcs_direct_inward (inward_no, supplier_name, inward_date, staff_name, remarks) VALUES (?, ?, ?, ?, ?)";
        const values = [finalNo, supplier_name, inward_date, staff_name, remarks];

        db.query(q, values, (err, result) => {
            if (err) return res.status(500).json(err);
            const inwardId = result.insertId;

            if (items && items.length > 0) {
                const qItems = "INSERT INTO pcs_direct_inward_items (inward_id, sku, style_name, size, qty) VALUES ?";
                const itemValues = items.map(item => [inwardId, item.sku || item.style_name, item.style_name, item.size, item.qty]);

                db.query(qItems, [itemValues], (err, result) => {
                    if (err) return res.status(500).json(err);
                    return res.status(200).json({ message: "Pcs Inward created successfully", id: inwardId });
                });
            } else {
                return res.status(200).json({ message: "Pcs Inward created successfully", id: inwardId });
            }
        });
    });
});

router.put("/:id", (req, res) => {
    const inwardId = req.params.id;
    const { supplier_name, inward_date, staff_name, remarks, items } = req.body;

    const qUpdate = "UPDATE pcs_direct_inward SET supplier_name=?, inward_date=?, staff_name=?, remarks=? WHERE id=?";
    db.query(qUpdate, [supplier_name, inward_date, staff_name, remarks, inwardId], (err) => {
        if (err) return res.status(500).json(err);

        db.query("DELETE FROM pcs_direct_inward_items WHERE inward_id = ?", [inwardId], (err) => {
            if (err) return res.status(500).json(err);

            if (items && items.length > 0) {
                const qItems = "INSERT INTO pcs_direct_inward_items (inward_id, sku, style_name, size, qty) VALUES ?";
                const itemValues = items.map(item => [inwardId, item.sku || item.style_name, item.style_name, item.size, item.qty]);

                db.query(qItems, [itemValues], (err, result) => {
                    if (err) return res.status(500).json(err);
                    return res.status(200).json("Pcs Inward updated successfully");
                });
            } else {
                return res.status(200).json("Pcs Inward updated successfully");
            }
        });
    });
});

router.delete("/:id", (req, res) => {
    const inwardId = req.params.id;
    const q = "DELETE FROM pcs_direct_inward WHERE id = ?";
    db.query(q, [inwardId], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Pcs Inward deleted successfully");
    });
});

export default router;
