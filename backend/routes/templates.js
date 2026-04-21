import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";

const router = express.Router();

// Get all templates
router.get("/", (req, res) => {
  db.query("SELECT * FROM templates ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add new template
router.post("/", (req, res) => {
  const { template_name, stock_action, is_sku, is_inclusive } = req.body;
  if (!template_name || !stock_action)
    return res.status(400).json({ error: "All fields are required" });

  db.query(
    "INSERT INTO templates (template_name, stock_action, is_sku, is_inclusive) VALUES (?, ?, ?, ?)",
    [template_name, stock_action, is_sku ?? 1, is_inclusive ?? 0],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Template saved successfully" });
    }
  );
});

// PUT /templates/:id
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { template_name, stock_action, is_sku, is_inclusive } = req.body;

  const sql = "UPDATE templates SET template_name = ?, stock_action = ?, is_sku = ?, is_inclusive = ? WHERE id = ?";
  db.query(sql, [template_name, stock_action, is_sku ?? 1, is_inclusive ?? 0, id], (err) => {
    if (err) return res.status(500).json({ error: "Error updating template" });
    res.json({ success: true, message: "Template updated successfully" });
  });
});

// Delete template
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM templates WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Template deleted successfully" });
  });
});

export default router;
