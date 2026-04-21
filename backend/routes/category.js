import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";
const router = express.Router();

// 🟢 GET all categories
router.get("/", (req, res) => {
  const sql = "SELECT * FROM categories ORDER BY id DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// 🟢 POST add new category
router.post("/", (req, res) => {
  const { category } = req.body;

  if (!category || category.trim() === "") {
    return res.status(400).json({ message: "Category name is required" });
  }

  const checkQuery = "SELECT * FROM categories WHERE LOWER(category) = LOWER(?)";
  db.query(checkQuery, [category], (err, result) => {
    if (err) {
      console.error("❌ Error checking category:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length > 0) {
      return res.status(409).json({ message: "⚠️ Category already exists!" });
    }

    const insertQuery = "INSERT INTO categories (category) VALUES (?)";
    db.query(insertQuery, [category], (err2) => {
      if (err2) {
        console.error("❌ Error inserting category:", err2);
        return res.status(500).json({ message: "Insert failed" });
      }
      res.status(201).json({ message: "✅ Category added successfully!" });
    });
  });
});

// 🟢 PUT update category by ID
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { category } = req.body;

  if (!category || category.trim() === "") {
    return res.status(400).json({ message: "Category name is required" });
  }

  const sql = "UPDATE categories SET category = ? WHERE id = ?";
  db.query(sql, [category, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Category not found" });
    res.json({ message: "✅ Category updated successfully" });
  });
});

// 🟢 DELETE category by ID
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM categories WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Category not found" });
    res.json({ message: "🗑️ Category deleted successfully" });
  });
});

export default router;
