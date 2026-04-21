import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";

const router = express.Router();

// ✅ GET — Fetch all colors
router.get("/", (req, res) => {
  db.query("SELECT * FROM color ORDER BY id DESC", (err, data) => {
    if (err) {
      console.error("Error fetching colors:", err);
      return res.status(500).json(err);
    }
    res.json(data);
  });
});

// ✅ POST — Add new color (with duplicate check)
router.post("/", (req, res) => {
  const { color } = req.body;

  if (!color || color.trim() === "") {
    return res.status(400).json({ message: "Color name is required" });
  }

  const checkQuery = "SELECT * FROM color WHERE LOWER(color) = LOWER(?)";
  db.query(checkQuery, [color], (err, result) => {
    if (err) {
      console.error("Error checking color:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length > 0) {
      return res.status(409).json({ message: "Color already exists!" });
    }

    db.query("INSERT INTO color (color) VALUES (?)", [color], (err2) => {
      if (err2) {
        console.error("Error inserting color:", err2);
        return res.status(500).json({ message: "Insert failed" });
      }
      res.status(201).json({ message: "Color added successfully!" });
    });
  });
});

// ✅ PUT — Update color
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { color } = req.body;

  if (!color || color.trim() === "") {
    return res.status(400).json({ message: "Color name is required" });
  }

  db.query("UPDATE color SET color = ? WHERE id = ?", [color, id], (err) => {
    if (err) {
      console.error("Error updating color:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "Color updated successfully!" });
  });
});

// ✅ DELETE — Remove color
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM color WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting color:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "Color deleted successfully!" });
  });
});

export default router;
