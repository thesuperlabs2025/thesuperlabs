import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";

const router = express.Router();

// ✅ GET — Fetch all mode of payments
router.get("/", (req, res) => {
  db.query("SELECT * FROM modeofpayment ORDER BY id DESC", (err, data) => {
    if (err) {
      console.error("Error fetching modeofpayment:", err);
      return res.status(500).json(err);
    }
    res.json(data);
  });
});

// ✅ POST — Add new mode of payment
router.post("/", (req, res) => {
  const { modeofpayment } = req.body;
  if (!modeofpayment) {
    return res.status(400).json({ error: "Mode of payment is required" });
  }

  const sql = "INSERT INTO modeofpayment (modeofpayment) VALUES (?)";
  db.query(sql, [modeofpayment], (err, result) => {
    if (err) {
      console.error("Error inserting modeofpayment:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "Mode of payment added successfully", id: result.insertId });
  });
});

// ✅ PUT — Update mode of payment
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { modeofpayment } = req.body;

  const sql = "UPDATE modeofpayment SET modeofpayment = ? WHERE id = ?";
  db.query(sql, [modeofpayment, id], (err) => {
    if (err) {
      console.error("Error updating modeofpayment:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "Mode of payment updated successfully" });
  });
});

// ✅ DELETE — Delete mode of payment
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM modeofpayment WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting modeofpayment:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "Mode of payment deleted successfully" });
  });
});

export default router;
