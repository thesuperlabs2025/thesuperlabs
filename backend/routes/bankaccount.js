import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";
const router = express.Router();

// ✅ GET — Fetch all sizes
router.get("/", (req, res) => {
  db.query("SELECT * FROM bankaccount ORDER BY id DESC", (err, data) => {
    if (err) {
      console.error("Error fetching bankaccount:", err);
      return res.status(500).json(err);
    }
    res.json(data);
  });
});
router.post("/", (req, res) => {
  const { bankaccount } = req.body;
  if (!bankaccount) {
    return res.status(400).json({ error: "bankaccount is required" });
  }

  const sql = "INSERT INTO bankaccount (bankaccount) VALUES (?)";
  db.query(sql, [bankaccount], (err, result) => {
    if (err) {
      console.error("Error inserting bankaccount:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "bankaccount added successfully", id: result.insertId });
  });
});

// ✅ PUT — Update mode of payment
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { bankaccount } = req.body;

  const sql = "UPDATE bankaccount SET bankaccount = ? WHERE id = ?";
  db.query(sql, [bankaccount, id], (err) => {
    if (err) {
      console.error("Error updating bankaccount:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "bankaccount updated successfully" });
  });
});

// ✅ DELETE — Delete mode of payment
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM bankaccount WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting bankaccount:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "bankaccount deleted successfully" });
  });
});
export default router;