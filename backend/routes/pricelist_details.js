import express from "express";
import db from "../db.js";

const router = express.Router();

// Get prices for a specific price list
router.get("/:price_list_id", (req, res) => {
    const { price_list_id } = req.params;
    const sql = `
    SELECT 
      p.id as product_id, 
      p.sku, 
      p.product_name, 
      COALESCE(d.mrp, p.mrp) as mrp, 
      COALESCE(d.selling_price, p.selling_price) as selling_price, 
      COALESCE(d.discount, p.discount) as discount,
      p.purchase_price
    FROM products p
    LEFT JOIN price_list_details d ON p.id = d.product_id AND d.price_list_id = ?
    ORDER BY p.product_name ASC
  `;

    db.query(sql, [price_list_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Update specific price list details
router.post("/update", (req, res) => {
    const { price_list_id, items } = req.body; // items: [{ product_id, mrp, selling_price, discount }]

    if (!price_list_id || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: "Invalid data" });
    }

    const queries = items.map(item => {
        return new Promise((resolve, reject) => {
            const sql = `
        INSERT INTO price_list_details (price_list_id, product_id, mrp, selling_price, discount)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE mrp = VALUES(mrp), selling_price = VALUES(selling_price), discount = VALUES(discount)
      `;
            db.query(sql, [price_list_id, item.product_id, item.mrp, item.selling_price, item.discount], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    });

    Promise.all(queries)
        .then(() => res.json({ message: "Prices updated successfully" }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Get product price for a specific price list by product ID
router.get("/product/:price_list_id/:product_id", (req, res) => {
    const { price_list_id, product_id } = req.params;
    const sql = `
    SELECT 
      p.id as product_id, 
      p.sku, 
      p.product_name, 
      COALESCE(d.mrp, p.mrp) as mrp, 
      COALESCE(d.selling_price, p.selling_price) as selling_price, 
      COALESCE(d.discount, p.discount) as discount,
      p.gst,
      p.purchase_price
    FROM products p
    LEFT JOIN price_list_details d ON p.id = d.product_id AND d.price_list_id = ?
    WHERE p.id = ?
  `;

    db.query(sql, [price_list_id, product_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: "Product not found" });
        res.json(results[0]);
    });
});

export default router;
