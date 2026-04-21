import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";

const router = express.Router();

// ✅ GET — Fetch all sizes
router.get("/", (req, res) => {
  db.query("SELECT * FROM size ORDER BY id DESC", (err, data) => {
    if (err) {
      console.error("Error fetching sizes:", err);
      return res.status(500).json(err);
    }
    res.json(data);
  });
});

// ✅ POST — Add new size (with duplicate check)
router.post("/", (req, res) => {
  const { size } = req.body;

  if (!size || size.trim() === "") {
    return res.status(400).json({ message: "Size name is required" });
  }

  const checkQuery = "SELECT * FROM size WHERE LOWER(size) = LOWER(?)";
  db.query(checkQuery, [size], (err, result) => {
    if (err) {
      console.error("Error checking size:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length > 0) {
      return res.status(409).json({ message: "Size already exists!" });
    }

    db.query("INSERT INTO size (size) VALUES (?)", [size], (err2) => {
      if (err2) {
        console.error("Error inserting size:", err2);
        return res.status(500).json({ message: "Insert failed" });
      }
      res.json({ message: "Size added successfully!" });
    });
  });
});

// ✅ PUT — Update size
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { size } = req.body;

  if (!size || size.trim() === "") {
    return res.status(400).json({ message: "Size name is required" });
  }

  db.query("UPDATE size SET size = ? WHERE id = ?", [size, id], (err) => {
    if (err) {
      console.error("Error updating size:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "Size updated successfully!" });
  });
});

// ✅ DELETE — Remove size
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM size WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting size:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "Size deleted successfully!" });
  });
});

export default router;
