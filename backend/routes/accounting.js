import express from "express";
import db from "../db.js";

const router = express.Router();

// Get all accounting years
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM accounting_years ORDER BY start_date DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new accounting year (WIZARD - Simplified)
router.post("/", async (req, res) => {
    const { year_name, start_date, end_date } = req.body;
    try {
        // 1. Insert new year
        const [result] = await db.promise().query(
            "INSERT INTO accounting_years (year_name, start_date, end_date, is_active) VALUES (?, ?, ?, FALSE)",
            [year_name, start_date, end_date]
        );
        const newYearId = result.insertId;

        // 2. Mark older years as closed
        await db.promise().query(
            "UPDATE accounting_years SET is_active = FALSE, is_closed = TRUE WHERE year_id != ?",
            [newYearId]
        );

        // 3. Set new year as active
        await db.promise().query(
            "UPDATE accounting_years SET is_active = TRUE WHERE year_id = ?",
            [newYearId]
        );

        // 4. ROLLOVER STOCK: Transfer current stock as opening stock for the new year
        try {
            // PRODUCTS
            const [products] = await db.promise().query("SELECT id, current_stock, selling_price FROM products");
            if (products.length > 0) {
                const values = products.map(p => [p.id, newYearId, p.current_stock, (p.current_stock * (p.selling_price || 0)), 'product']);
                await db.promise().query(
                    "INSERT INTO product_opening_balances (product_id, year_id, opening_stock, opening_valuation, product_type) VALUES ?",
                    [values]
                );
            }

            // YARN
            const [yarn] = await db.promise().query("SELECT id, current_stock FROM yarn");
            if (yarn.length > 0) {
                const values = yarn.map(y => [y.id, newYearId, y.current_stock, 0, 'yarn']);
                await db.promise().query(
                    "INSERT INTO product_opening_balances (product_id, year_id, opening_stock, opening_valuation, product_type) VALUES ?",
                    [values]
                );
            }

            // FABRICS
            const [fabrics] = await db.promise().query("SELECT id, current_stock FROM fabrics");
            if (fabrics.length > 0) {
                const values = fabrics.map(f => [f.id, newYearId, f.current_stock, 0, 'fabric']);
                await db.promise().query(
                    "INSERT INTO product_opening_balances (product_id, year_id, opening_stock, opening_valuation, product_type) VALUES ?",
                    [values]
                );
            }

            // TRIMS
            const [trims] = await db.promise().query("SELECT id, current_stock FROM trims");
            if (trims.length > 0) {
                const values = trims.map(t => [t.id, newYearId, t.current_stock, 0, 'trim']);
                await db.promise().query(
                    "INSERT INTO product_opening_balances (product_id, year_id, opening_stock, opening_valuation, product_type) VALUES ?",
                    [values]
                );
            }
        } catch (rolloverErr) {
            console.error("Stock Rollover Warning:", rolloverErr);
            // We don't block the whole process if rollover fails, but it's important to log
        }

        res.json({ success: true, year_id: newYearId });
    } catch (err) {
        console.error("Year Creation Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Get current active year
router.get("/active", async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM accounting_years WHERE is_active = TRUE LIMIT 1");
        if (rows.length === 0) return res.status(404).json({ message: "No active year found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
