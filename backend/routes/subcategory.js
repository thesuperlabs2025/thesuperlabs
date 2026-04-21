import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";

const router = express.Router();

// 🟢 GET all sub-categories
router.get("/", (req, res) => {
  db.query("SELECT * FROM sub_categories ORDER BY id DESC", (err, result) => {
    if (err) {
      console.error("❌ Error fetching sub categories:", err);
      return res.status(500).send("Database error");
    }
    res.json(result);
  });
});

// 🟢 POST - Add new sub-category (with duplicate check)
router.post("/", (req, res) => {
  const { sub_category } = req.body;

  if (!sub_category || sub_category.trim() === "") {
    return res.status(400).json({ message: "Sub Category name is required" });
  }

  const checkQuery =
    "SELECT * FROM sub_categories WHERE LOWER(sub_category) = LOWER(?)";
  db.query(checkQuery, [sub_category], (err, result) => {
    if (err) {
      console.error("❌ Error checking sub category:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length > 0) {
      return res.status(409).json({ message: "⚠️ Sub Category already exists!" });
    }

    const insertQuery = "INSERT INTO sub_categories (sub_category) VALUES (?)";
    db.query(insertQuery, [sub_category], (err2) => {
      if (err2) {
        console.error("❌ Error inserting sub category:", err2);
        return res.status(500).json({ message: "Insert failed" });
      }
      res.status(201).json({ message: "✅ Sub Category added successfully!" });
    });
  });
});

// 🟢 PUT - Update sub-category

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { sub_category } = req.body;

  if (!sub_category || sub_category.trim() === "")
    return res.status(400).json({ message: "Sub Category name is required" });

  db.query(
    "UPDATE sub_categories SET sub_category = ? WHERE id = ?",
    [sub_category, id],
    (err, result) => {
      if (err) return res.status(500).send("Database error");
      res.json({ message: "Sub Category updated successfully!" });
    }
  );
});
// 🟢 DELETE - Remove sub-category
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM sub_categories WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting sub category:", err);
      return res.status(500).send("Database error");
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Sub Category not found" });
    }
    res.json({ message: "🗑️ Sub Category deleted successfully!" });
  });
});

export default router;
