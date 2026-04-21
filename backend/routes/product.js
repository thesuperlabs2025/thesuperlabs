import express from "express";
import db from "../db.js"; // ✅ adjust path as needed
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";

const router = express.Router();

// ===================== GET ALL SKUS (for duplicate check) =====================
router.get("/skus", (req, res) => {
  const sql = "SELECT sku FROM products";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const skus = results.map(r => r.sku).filter(Boolean);
    res.json(skus);
  });
});

// ===================== GET LAST BARCODE =====================
router.get("/last-barcode", (req, res) => {
  const sql = "SELECT MAX(CAST(barcode AS UNSIGNED)) as lastBarcode FROM products WHERE barcode REGEXP '^[0-9]+$'";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const lastBarcode = result[0].lastBarcode || 0;
    res.json({ lastBarcode });
  });
});

// ===================== GET ALL PRODUCTS (with search) =====================
router.get("/", (req, res) => {
  const searchTerm = req.query.term;
  const productType = req.query.type;

  let sql = `
    SELECT id, product_name, sku, mrp, gst, discount, current_stock, minimum_stock, barcode, selling_price, hsn_code, product_type, category, uom
    FROM products
    WHERE 1=1
  `;
  const params = [];

  if (searchTerm) {
    sql += " AND (product_name LIKE ? OR sku LIKE ? OR barcode LIKE ?)";
    params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
  }

  if (productType) {
    sql += " AND product_type = ?";
    params.push(productType);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ===================== SEARCH PRODUCTS (autocomplete) =====================
router.get("/search", (req, res) => {
  const term = req.query.term || "";
  const type = req.query.type;
  let sql = `
    SELECT id, product_name, sku, selling_price, gst_percentage, product_type 
    FROM products 
    WHERE product_name LIKE ?
  `;
  const params = [`%${term}%`];

  if (type) {
    sql += " AND product_type = ?";
    params.push(type);
  }

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ===================== ADD PRODUCT =====================
router.post("/", (req, res) => {
  const fields = [
    "sku", "product_name", "product_type", "category", "sub_category", "super_sub_category",
    "hsn_code", "gst", "discount", "barcode", "size", "color", "brand_name",
    "current_stock", "minimum_stock", "selling_price", "purchase_price", "mrp",
    "description", "uom", "boxes"
  ];

  const values = fields.map(f => {
    if (["gst", "discount", "current_stock", "minimum_stock", "selling_price", "purchase_price", "mrp"].includes(f)) {
      const val = parseFloat(req.body[f]);
      return isNaN(val) ? 0 : val;
    }

    if (f === "barcode") {
      const val = req.body[f];
      return val === "" || val == null ? null : val;
    }

    return req.body[f] === "" ? null : req.body[f];
  });

  const placeholders = fields.map(() => "?").join(",");
  const sql = `INSERT INTO products (${fields.join(",")}) VALUES (${placeholders})`;

  console.log("📦 Insert values:", values);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ SQL Error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "✅ Product added successfully", id: result.insertId });
  });
});

// ===================== UPDATE PRODUCT =====================
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    sku, product_name, product_type, category, sub_category, super_sub_category,
    hsn_code, gst, discount, barcode, size, color, brand_name,
    current_stock, minimum_stock, selling_price, purchase_price, mrp, description,
    uom, boxes
  } = req.body;

  const sql = `
    UPDATE products SET 
      sku=?, product_name=?, product_type=?, category=?, sub_category=?, super_sub_category=?,
      hsn_code=?, gst=?, discount=?, barcode=?, size=?, color=?, brand_name=?,
      current_stock=?, minimum_stock=?, selling_price=?, purchase_price=?, mrp=?, description=?,
      uom=?, boxes=?
    WHERE id=?`;

  const values = [
    sku, product_name, product_type, category, sub_category, super_sub_category,
    hsn_code, gst, discount, barcode, size, color, brand_name,
    current_stock || 0, minimum_stock || 0, selling_price || 0,
    purchase_price || 0, mrp || 0, description || "",
    uom || null, boxes || null, id
  ];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Product updated successfully" });
  });
});
// ===================== DELETE SINGLE PRODUCT =====================
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM products WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "🗑️ Product deleted successfully" });
  });
});

// ===================== DELETE MULTIPLE PRODUCTS =====================
router.post("/delete-multiple", (req, res) => {
  const { ids } = req.body;
  if (!ids || !ids.length) return res.status(400).json({ message: "No ids provided" });

  const placeholders = ids.map(() => "?").join(",");
  const sql = `DELETE FROM products WHERE id IN (${placeholders})`;

  db.query(sql, ids, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Selected products deleted successfully" });
  });
});

// ===================== GET SINGLE PRODUCT BY ID =====================
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM products WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json(result[0]);
  });
});

export default router;
