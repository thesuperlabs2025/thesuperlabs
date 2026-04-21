import express from "express";
import db from "../db.js";

const router = express.Router();

// ===================== GET STOCK DATA =====================
router.get("/", (req, res) => {
    const { category, sub_category, brand, searchTerm, minStock, maxStock } = req.query;
    const yearId = req.headers['x-year-id'];

    let sql = `
        SELECT 
            p.id, 
            p.product_name, 
            p.sku, 
            p.barcode,
            p.category, 
            p.sub_category,
            p.brand_name, 
            COALESCE(ob.opening_stock, 0) as year_opening_stock,
            p.current_stock, 
            p.minimum_stock, 
            p.selling_price,
            (p.current_stock * p.selling_price) as valuation_selling
        FROM products p
        LEFT JOIN product_opening_balances ob ON p.id = ob.product_id AND ob.year_id = ?
        WHERE 1=1
    `;
    const params = [yearId];

    if (category) {
        sql += " AND category = ?";
        params.push(category);
    }
    if (sub_category) {
        sql += " AND sub_category = ?";
        params.push(sub_category);
    }
    if (brand) {
        sql += " AND brand_name = ?";
        params.push(brand);
    }
    if (minStock) {
        sql += " AND current_stock >= ?";
        params.push(Number(minStock));
    }
    if (maxStock) {
        sql += " AND current_stock <= ?";
        params.push(Number(maxStock));
    }
    if (searchTerm) {
        sql += " AND (product_name LIKE ? OR sku LIKE ? OR barcode LIKE ?)";
        const likeSearch = `%${searchTerm}%`;
        params.push(likeSearch, likeSearch, likeSearch);
    }

    sql += " ORDER BY current_stock DESC, product_name ASC";

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Stock Report Query Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// ===================== GET FILTERS DATA =====================
router.get("/filters", (req, res) => {
    const sqlCategories = "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != ''";
    const sqlSubCategories = "SELECT DISTINCT sub_category FROM products WHERE sub_category IS NOT NULL AND sub_category != ''";
    const sqlBrands = "SELECT DISTINCT brand_name FROM products WHERE brand_name IS NOT NULL AND brand_name != ''";

    db.query(sqlCategories, (err, catResults) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query(sqlSubCategories, (err, subCatResults) => {
            if (err) return res.status(500).json({ error: err.message });
            db.query(sqlBrands, (err, brandResults) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({
                    categories: catResults.map(r => r.category),
                    subCategories: subCatResults.map(r => r.sub_category),
                    brands: brandResults.map(r => r.brand_name)
                });
            });
        });
    });
});

// ===================== GET STOCK SUMMARY =====================
router.get("/summary", (req, res) => {
    const sql = `
        SELECT 
            category, 
            sub_category, 
            COUNT(*) as product_count, 
            SUM(current_stock) as total_stock,
            SUM(CASE WHEN current_stock <= minimum_stock THEN 1 ELSE 0 END) as low_stock_count
        FROM products
        GROUP BY category, sub_category
        ORDER BY category, sub_category
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ===================== GET YARN STOCK REPORT =====================
router.get("/yarn", (req, res) => {
    const { searchTerm, minStock, maxStock } = req.query;
    const yearId = req.headers['x-year-id'];

    let sql = `
        SELECT 
            y.id, 
            y.yarn_name, 
            y.yarn_sku, 
            y.counts, 
            y.color,
            y.composition,
            COALESCE(ob.opening_stock, 0) as year_opening_stock,
            y.current_stock, 
            y.minimum_stock
        FROM yarn y
        LEFT JOIN product_opening_balances ob ON y.id = ob.product_id AND ob.year_id = ? AND ob.product_type = 'yarn'
        WHERE 1=1
    `;
    const params = [yearId];

    if (minStock) {
        sql += " AND current_stock >= ?";
        params.push(Number(minStock));
    }
    if (maxStock) {
        sql += " AND current_stock <= ?";
        params.push(Number(maxStock));
    }
    if (searchTerm) {
        sql += " AND (yarn_name LIKE ? OR yarn_sku LIKE ? OR color LIKE ? OR counts LIKE ?)";
        const likeSearch = `%${searchTerm}%`;
        params.push(likeSearch, likeSearch, likeSearch, likeSearch);
    }

    sql += " ORDER BY current_stock DESC, yarn_name ASC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ===================== GET FABRIC STOCK REPORT =====================
router.get("/fabric", (req, res) => {
    const { searchTerm, minStock, maxStock } = req.query;
    const yearId = req.headers['x-year-id'];

    let sql = `
        SELECT 
            f.id, 
            f.fabric_name, 
            f.fabric_sku, 
            f.gsm,
            f.dia,
            f.color,
            f.counts,
            f.composition,
            COALESCE(ob.opening_stock, 0) as year_opening_stock,
            f.current_stock, 
            f.minimum_stock
        FROM fabrics f
        LEFT JOIN product_opening_balances ob ON f.id = ob.product_id AND ob.year_id = ? AND ob.product_type = 'fabric'
        WHERE 1=1
    `;
    const params = [yearId];

    if (minStock) {
        sql += " AND current_stock >= ?";
        params.push(Number(minStock));
    }
    if (maxStock) {
        sql += " AND current_stock <= ?";
        params.push(Number(maxStock));
    }
    if (searchTerm) {
        sql += " AND (fabric_name LIKE ? OR fabric_sku LIKE ? OR color LIKE ? OR gsm LIKE ? OR dia LIKE ?)";
        const likeSearch = `%${searchTerm}%`;
        params.push(likeSearch, likeSearch, likeSearch, likeSearch, likeSearch);
    }

    sql += " ORDER BY current_stock DESC, fabric_name ASC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ===================== GET TRIMS STOCK REPORT =====================
router.get("/trims", (req, res) => {
    const { searchTerm, minStock, maxStock } = req.query;
    const yearId = req.headers['x-year-id'];

    let sql = `
        SELECT 
            t.id, 
            t.trims_name, 
            t.trims_sku, 
            t.color,
            t.uom,
            COALESCE(ob.opening_stock, 0) as year_opening_stock,
            t.current_stock, 
            t.minimum_stock
        FROM trims t
        LEFT JOIN product_opening_balances ob ON t.id = ob.product_id AND ob.year_id = ? AND ob.product_type = 'trim'
        WHERE 1=1
    `;
    const params = [yearId];

    if (minStock) {
        sql += " AND current_stock >= ?";
        params.push(Number(minStock));
    }
    if (maxStock) {
        sql += " AND current_stock <= ?";
        params.push(Number(maxStock));
    }
    if (searchTerm) {
        sql += " AND (trims_name LIKE ? OR trims_sku LIKE ? OR color LIKE ?)";
        const likeSearch = `%${searchTerm}%`;
        params.push(likeSearch, likeSearch, likeSearch);
    }

    sql += " ORDER BY current_stock DESC, trims_name ASC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

export default router;
