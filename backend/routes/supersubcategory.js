import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";

const router = express.Router();

// ✅ GET — Fetch all
router.get("/", (req, res) => {
  db.query("SELECT * FROM super_sub_categories ORDER BY id DESC", (err, result) => {
    if (err) {
      console.error("Error fetching super sub categories:", err);
      return res.status(500).send("Database error");
    }
    res.send(result);
  });
});

// ✅ POST — Add new (with duplicate check)
router.post("/", (req, res) => {
  const { super_sub_category } = req.body;

  if (!super_sub_category || super_sub_category.trim() === "") {
    return res.status(400).json({ message: "Super Sub Category name is required" });
  }

  const checkQuery =
    "SELECT * FROM super_sub_categories WHERE LOWER(super_sub_category) = LOWER(?)";

  db.query(checkQuery, [super_sub_category], (err, result) => {
    if (err) {
      console.error("Error checking super sub category:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length > 0) {
      return res.status(409).json({ message: "Super Sub Category already exists!" });
    }

    const insertQuery =
      "INSERT INTO super_sub_categories (super_sub_category) VALUES (?)";
    db.query(insertQuery, [super_sub_category], (err2) => {
      if (err2) {
        console.error("Error inserting super sub category:", err2);
        return res.status(500).json({ message: "Insert failed" });
      }
      res.status(201).json({ message: "Super Sub Category added successfully!" });
    });
  });
});

// ✅ PUT — Update
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { super_sub_category } = req.body;

  if (!super_sub_category || super_sub_category.trim() === "") {
    return res.status(400).json({ message: "Super Sub Category name is required" });
  }

  db.query(
    "UPDATE super_sub_categories SET super_sub_category = ? WHERE id = ?",
    [super_sub_category, id],
    (err) => {
      if (err) {
        console.error("Error updating super sub category:", err);
        return res.status(500).send("Database error");
      }
      res.json({ message: "Super Sub Category updated successfully!" });
    }
  );
});

// ✅ DELETE — Remove
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM super_sub_categories WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting super sub category:", err);
      return res.status(500).send("Database error");
    }
    res.json({ message: "Super Sub Category deleted successfully!" });
  });
});

export default router;
