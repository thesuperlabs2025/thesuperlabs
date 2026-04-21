import express from "express";
import db from "../db.js";

const router = express.Router();

// Get all products for price list
router.get("/", (req, res) => {
    const sql = `
    SELECT id, sku, product_name, mrp, selling_price, purchase_price, gst, discount
    FROM products
    ORDER BY product_name ASC
  `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching price list:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Update prices in bulk
router.post("/update", (req, res) => {
    const { prices } = req.body; // Array of { id, mrp, selling_price, purchase_price }

    if (!prices || !Array.isArray(prices)) {
        return res.status(400).json({ error: "Invalid data format" });
    }

    const queries = prices.map(p => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE products SET mrp = ?, selling_price = ?, purchase_price = ? WHERE id = ?";
            db.query(sql, [p.mrp, p.selling_price, p.purchase_price, p.id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    });

    Promise.all(queries)
        .then(() => res.json({ message: "Prices updated successfully" }))
        .catch(err => {
            console.error("Error updating prices:", err);
            res.status(500).json({ error: err.message });
        });
});

export default router;
