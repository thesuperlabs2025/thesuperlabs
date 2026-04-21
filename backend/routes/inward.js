import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// --- 1. Get Next Inward No ---
router.get("/next-inward-no", async (req, res) => {
    const yearId = req.headers['x-year-id'];
    try {
        const [rows] = await db.promise().query(
            `SELECT id FROM inward WHERE year_id = ? ORDER BY id DESC LIMIT 1`,
            [yearId]
        );
        const lastNo = rows.length > 0 ? rows[0].id : 0;
        const nextNo = lastNo + 1;
        res.json({ inwardNo: nextNo, lastInwardNo: lastNo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- 2. Create Inward ---
router.post("/", async (req, res) => {
    const {
        supplier_name = null,
        mobile = null,
        sales_person = null,
        inward_date = null,
        reference_no = null,
        address = null,
        details = null,
        total_qty = 0,
        items = [],
        template_id,
        stock_action // We can pass this from frontend based on template
    } = req.body;

    // Validate SKUs and Qty
    if (!items || items.length === 0) {
        return res.status(400).json({ error: "No items provided" });
    }

    for (const item of items) {
        if (!item.sku || item.sku.trim() === "") {
            return res.status(400).json({ error: "SKU missing for one of the items" });
        }
        if (isNaN(Number(item.qty))) {
            return res.status(400).json({ error: `Invalid qty for sku ${item.sku}` });
        }
    }

    try {
        // 1. Insert Inward Header
        const yearId = req.headers['x-year-id'];
        const sqlHeader = `
      INSERT INTO inward
      (supplier_name, mobile, sales_person, inward_date, reference_no, address, details, total_qty, template_id, stock_action, year_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        // Ensure Date format YYYY-MM-DD
        const formatDate = (date) => {
            if (!date) return null;
            if (date.includes('T')) return date.split('T')[0];
            return date;
        };

        const resultHeader = await new Promise((resolve, reject) => {
            db.query(
                sqlHeader,
                [
                    supplier_name, mobile, sales_person, formatDate(inward_date), reference_no, address, details, total_qty, template_id, stock_action, yearId
                ],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        const inward_id = resultHeader.insertId;

        // 2. Insert Items
        const values = items.map((item) => [
            inward_id,
            item.sku,
            Number(item.qty) || 0
        ]);

        if (values.length > 0) {
            const sqlItems = `INSERT INTO inward_items (inward_id, sku, qty) VALUES ?`;
            await new Promise((resolve, reject) => {
                db.query(sqlItems, [values], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }

        // 3. Update Stock (If applicable)
        // Assuming stock_action is 'add' for Inward usually, but we check what's passed
        if (stock_action === 'add' || stock_action === 'reduce') {
            for (const item of items) {
                const qty = Number(item.qty);
                const sku = item.sku.trim();

                // Get current stock
                const [rows] = await db.promise().query("SELECT current_stock FROM products WHERE sku = ?", [sku]);
                if (rows.length > 0) {
                    const currentStock = Number(rows[0].current_stock) || 0;
                    let newStock = currentStock;
                    if (stock_action === 'add') newStock += qty;
                    else if (stock_action === 'reduce') newStock -= qty;

                    await db.promise().query("UPDATE products SET current_stock = ? WHERE sku = ?", [newStock, sku]);
                }
            }
        }

        res.json({ success: true, message: "Inward saved successfully!", id: inward_id });

    } catch (err) {
        console.error("Error creating inward:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- 3. List Inwards ---
router.get("/", async (req, res) => {
    try {
        const { term } = req.query;
        const yearId = req.headers['x-year-id'];
        let sql = `SELECT * FROM inward WHERE year_id = ? ORDER BY id DESC`;
        let params = [yearId];

        if (term) {
            sql = `SELECT * FROM inward WHERE (supplier_name LIKE ? OR inward_no LIKE ?) AND year_id = ? ORDER BY id DESC`;
            params = [`%${term}%`, `%${term}%`, yearId];
        }

        const [rows] = await db.promise().query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- 4. Get Single Inward ---
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [headerRows] = await db.promise().query("SELECT * FROM inward WHERE id = ?", [id]);

        if (headerRows.length === 0) {
            return res.status(404).json({ message: "Inward not found" });
        }

        const [itemRows] = await db.promise().query("SELECT * FROM inward_items WHERE inward_id = ?", [id]);

        res.json({
            ...headerRows[0],
            items: itemRows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- 5. Update Inward ---
router.put("/:id", async (req, res) => {
    // Logic for updating is complex due to stock adjustments. 
    // For simplicity given the request, I will implement a basic replacement logic:
    // 1. Revert old stock changes.
    // 2. Delete old items.
    // 3. Update header.
    // 4. Insert new items.
    // 5. Apply new stock changes.

    const { id } = req.params;
    const {
        supplier_name, mobile, sales_person, inward_date, reference_no, address, details, total_qty, items, template_id, stock_action
    } = req.body;

    try {
        // 1. Get Old Data to Revert Stock
        const [oldInward] = await db.promise().query("SELECT stock_action FROM inward WHERE id = ?", [id]);
        const oldStockAction = oldInward[0]?.stock_action;

        const [oldItems] = await db.promise().query("SELECT sku, qty FROM inward_items WHERE inward_id = ?", [id]);

        // Revert Old Stock
        if (oldStockAction === 'add' || oldStockAction === 'reduce') {
            for (const item of oldItems) {
                const [prod] = await db.promise().query("SELECT current_stock FROM products WHERE sku = ?", [item.sku]);
                if (prod.length > 0) {
                    let stock = Number(prod[0].current_stock);
                    // Reverse the action
                    if (oldStockAction === 'add') stock -= Number(item.qty);
                    else if (oldStockAction === 'reduce') stock += Number(item.qty);
                    await db.promise().query("UPDATE products SET current_stock = ? WHERE sku = ?", [stock, item.sku]);
                }
            }
        }

        // 2. Delete Old Items
        await db.promise().query("DELETE FROM inward_items WHERE inward_id = ?", [id]);

        // 3. Update Header
        const formatDate = (date) => {
            if (!date) return null;
            if (date.includes('T')) return date.split('T')[0];
            return date;
        };

        const updateSql = `
            UPDATE inward 
            SET supplier_name=?, mobile=?, sales_person=?, inward_date=?, reference_no=?, address=?, details=?, total_qty=?, template_id=?, stock_action=?
            WHERE id=?
        `;
        await db.promise().query(updateSql, [supplier_name, mobile, sales_person, formatDate(inward_date), reference_no, address, details, total_qty, template_id, stock_action, id]);

        // 4. Insert New Items
        const values = items.map((item) => [
            id,
            item.sku,
            Number(item.qty) || 0
        ]);

        if (values.length > 0) {
            const sqlItems = `INSERT INTO inward_items (inward_id, sku, qty) VALUES ?`;
            await db.promise().query(sqlItems, [values]);
        }

        // 5. Apply New Stock
        if (stock_action === 'add' || stock_action === 'reduce') {
            for (const item of items) {
                const [prod] = await db.promise().query("SELECT current_stock FROM products WHERE sku = ?", [item.sku]);
                if (prod.length > 0) {
                    let stock = Number(prod[0].current_stock);
                    if (stock_action === 'add') stock += Number(item.qty);
                    else if (stock_action === 'reduce') stock -= Number(item.qty);
                    await db.promise().query("UPDATE products SET current_stock = ? WHERE sku = ?", [stock, item.sku]);
                }
            }
        }

        res.json({ success: true, message: "Inward updated successfully!" });

    } catch (err) {
        console.error("Error updating inward:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- 6. Delete Inward ---
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        // Revert stock before deleting
        const [inward] = await db.promise().query("SELECT stock_action FROM inward WHERE id = ?", [id]);
        const stockAction = inward[0]?.stock_action;
        const [items] = await db.promise().query("SELECT sku, qty FROM inward_items WHERE inward_id = ?", [id]);

        if (stockAction === 'add' || stockAction === 'reduce') {
            for (const item of items) {
                const [prod] = await db.promise().query("SELECT current_stock FROM products WHERE sku = ?", [item.sku]);
                if (prod.length > 0) {
                    let stock = Number(prod[0].current_stock);
                    if (stockAction === 'add') stock -= Number(item.qty);
                    else if (stockAction === 'reduce') stock += Number(item.qty);
                    await db.promise().query("UPDATE products SET current_stock = ? WHERE sku = ?", [stock, item.sku]);
                }
            }
        }

        await db.promise().query("DELETE FROM inward WHERE id = ?", [id]);
        res.json({ success: true, message: "Inward deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
