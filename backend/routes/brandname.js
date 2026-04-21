import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";

const router = express.Router();

// ✅ GET — Fetch all sizes
router.get("/", (req, res) => {
  db.query("SELECT * FROM brandname ORDER BY id DESC", (err, result) => {
    if (err) {
      console.error("Error fetching brand names:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
});

// ✅ ADD brand name
router.post("/", (req, res) => {
  const { brandname } = req.body;
  if (!brandname) return res.status(400).json({ error: "Brand name is required" });

  db.query("INSERT INTO brandname (brandname) VALUES (?)", [brandname], (err) => {
    if (err) {
      console.error("Error adding brand name:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Brand name added successfully" });
  });
});

// ✅ UPDATE brand name
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { brandname } = req.body;
  if (!brandname) return res.status(400).json({ error: "Brand name is required" });

  db.query("UPDATE brandname SET brandname = ? WHERE id = ?", [brandname, id], (err) => {
    if (err) {
      console.error("Error updating brand name:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Brand name updated successfully" });
  });
});

// ✅ DELETE brand name
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM brandname WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting brand name:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Brand name deleted successfully" });
  });
});

export default router;
