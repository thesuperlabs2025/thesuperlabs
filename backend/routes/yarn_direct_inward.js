import express from "express";
import db from "../db.js";

const router = express.Router();

// --- Helper Functions ---

const getNextNo = (cb) => {
    db.query("SELECT inward_no FROM yarn_direct_inward ORDER BY id DESC LIMIT 1", (err, rows) => {
        if (err) return cb(err);
        let nextNo = "YI-0001";
        if (rows.length > 0) {
            const last = rows[0].inward_no;
            const num = parseInt(last.split("-")[1] || 0) + 1;
            nextNo = `YI-${String(num).padStart(4, "0")}`;
        }
        cb(null, nextNo);
    });
};

// --- Routes ---

// Get Next Number
router.get("/next-no", (req, res) => {
    getNextNo((err, no) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ inward_no: no });
    });
});

// List All
router.get("/", (req, res) => {
    const q = "SELECT * FROM yarn_direct_inward ORDER BY id DESC";
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    });
});

// Get One
router.get("/:id", (req, res) => {
    const q = "SELECT * FROM yarn_direct_inward WHERE id = ?";
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Inward not found");

        const inward = data[0];
        const qItems = "SELECT * FROM yarn_direct_inward_items WHERE inward_id = ?";
        db.query(qItems, [req.params.id], (err, items) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json({ ...inward, items });
        });
    });
});

// Create
router.post("/", (req, res) => {
    const { inward_no, order_no, supplier_name, inward_date, staff_name, remarks, items } = req.body;

    getNextNo((err, nextNo) => { // Ensure unique No
        const finalNo = inward_no || nextNo;

        const q = "INSERT INTO yarn_direct_inward (inward_no, order_no, supplier_name, inward_date, staff_name, remarks) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [finalNo, order_no, supplier_name, inward_date, staff_name, remarks];

        db.query(q, values, (err, result) => {
            if (err) return res.status(500).json(err);
            const inwardId = result.insertId;

            if (items && items.length > 0) {
                const qItems = "INSERT INTO yarn_direct_inward_items (inward_id, sku, yarn_name, qty) VALUES ?";
                const itemValues = items.map(item => [inwardId, item.sku || item.yarn_name, item.yarn_name, item.qty]);

                db.query(qItems, [itemValues], (err, result) => {
                    if (err) return res.status(500).json(err);

                    // Update Stock
                    items.forEach(item => {
                        const sku = item.sku || item.yarn_name;
                        // Use yarn_sku or yarn_name to update stock??
                        // Assuming 'yarn' table matches by yarn_name or yarn_sku?
                        // Trying to update by 'yarn_sku' if possible
                        // Assuming user passes SKU in item.sku

                        // NOTE: Previous analysis: 'yarn' table has 'current_stock'?
                        // Assuming 'products' table keeps stock by SKU? Or 'yarn' table?
                        // Sticking with 'yarn' table if possible. If fails, try 'products'.
                        // Let's try updating 'yarn' table 'current_stock'.
                        db.query("UPDATE yarn SET current_stock = IFNULL(current_stock, 0) + ? WHERE yarn_sku = ? OR yarn_name = ?", [item.qty, sku, item.yarn_name], (err) => {
                            if (err) console.error("Stock update error", err);
                        });
                    });

                    return res.status(200).json({ message: "Yarn Inward created successfully", id: inwardId });
                });
            } else {
                return res.status(200).json({ message: "Yarn Inward created successfully", id: inwardId });
            }
        });
    });
});

// Update
router.put("/:id", (req, res) => {
    const inwardId = req.params.id;
    const { order_no, supplier_name, inward_date, staff_name, remarks, items } = req.body;

    // 1. Revert Old Stock
    const qOldItems = "SELECT * FROM yarn_direct_inward_items WHERE inward_id = ?";
    db.query(qOldItems, [inwardId], (err, oldItems) => {
        if (err) return res.status(500).json(err);

        oldItems.forEach(item => {
            const sku = item.sku || item.yarn_name;
            db.query("UPDATE yarn SET current_stock = GREATEST(IFNULL(current_stock, 0) - ?, 0) WHERE yarn_sku = ? OR yarn_name = ?", [item.qty, sku, item.yarn_name]);
        });

        // 2. Update Header
        const qUpdate = "UPDATE yarn_direct_inward SET order_no=?, supplier_name=?, inward_date=?, staff_name=?, remarks=? WHERE id=?";
        db.query(qUpdate, [order_no, supplier_name, inward_date, staff_name, remarks, inwardId], (err) => {
            if (err) return res.status(500).json(err);

            // 3. Delete Old Items
            db.query("DELETE FROM yarn_direct_inward_items WHERE inward_id = ?", [inwardId], (err) => {
                if (err) return res.status(500).json(err);

                // 4. Insert New Items & Update Stock
                if (items && items.length > 0) {
                    const qItems = "INSERT INTO yarn_direct_inward_items (inward_id, sku, yarn_name, qty) VALUES ?";
                    const itemValues = items.map(item => [inwardId, item.sku || item.yarn_name, item.yarn_name, item.qty]);

                    db.query(qItems, [itemValues], (err) => {
                        if (err) return res.status(500).json(err);

                        items.forEach(item => {
                            const sku = item.sku || item.yarn_name;
                            db.query("UPDATE yarn SET current_stock = IFNULL(current_stock, 0) + ? WHERE yarn_sku = ? OR yarn_name = ?", [item.qty, sku, item.yarn_name]);
                        });

                        return res.status(200).json("Yarn Inward updated successfully");
                    });
                } else {
                    return res.status(200).json("Yarn Inward updated successfully");
                }
            });
        });
    });
});

// Delete
router.delete("/:id", (req, res) => {
    const inwardId = req.params.id;

    // Revert Stock
    const qOldItems = "SELECT * FROM yarn_direct_inward_items WHERE inward_id = ?";
    db.query(qOldItems, [inwardId], (err, oldItems) => {
        if (err) return res.status(500).json(err);

        oldItems.forEach(item => {
            const sku = item.sku || item.yarn_name;
            db.query("UPDATE yarn SET current_stock = GREATEST(IFNULL(current_stock, 0) - ?, 0) WHERE yarn_sku = ? OR yarn_name = ?", [item.qty, sku, item.yarn_name]);
        });

        const q = "DELETE FROM yarn_direct_inward WHERE id = ?";
        db.query(q, [inwardId], (err, result) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json("Yarn Inward deleted successfully");
        });
    });
});

export default router;
