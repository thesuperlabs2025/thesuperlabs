import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";
const router = express.Router();

// ✅ GET — Fetch all sizes
router.get("/", (req, res) => {
  db.query("SELECT * FROM accounthead ORDER BY id DESC", (err, data) => {
    if (err) {
      console.error("Error fetching accounthead:", err);
      return res.status(500).json(err);
    }
    res.json(data);
  });
});

router.post("/", (req, res) => {
  const { accounthead } = req.body;
  if (!accounthead) {
    return res.status(400).json({ error: "accounthead is required" });
  }

  const sql = "INSERT INTO accounthead (accounthead) VALUES (?)";
  db.query(sql, [accounthead], (err, result) => {
    if (err) {
      console.error("Error inserting accounthead:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "accounthead added successfully", id: result.insertId });
  });
});

// ✅ PUT — Update mode of payment
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { accounthead } = req.body;

  const sql = "UPDATE accounthead SET accounthead = ? WHERE id = ?";
  db.query(sql, [accounthead, id], (err) => {
    if (err) {
      console.error("Error updating accounthead:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "accounthead updated successfully" });
  });
});

// ✅ DELETE — Delete mode of payment
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM accounthead WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting accounthead:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "accounthead deleted successfully" });
  });
});
export default router;