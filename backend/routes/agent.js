import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

/* =========================
   GET — Fetch all agents
========================= */
router.get("/", (req, res) => {
  const query = "SELECT * FROM agents ORDER BY id DESC";
  db.query(query, (err, data) => {
    if (err) {
      console.error("Error fetching agents:", err);
      return res.status(500).json(err);
    }
    res.json(data);
  });
});

/* =========================
   POST — Add new agent
========================= */
router.post("/", (req, res) => {
  const {
    agent_name,
    agent_percent,
    address,
    country,
    state,
    city,
    pincode
  } = req.body;

  if (!agent_name || agent_name.trim() === "") {
    return res.status(400).json({ message: "Agent name is required" });
  }

  const checkQuery =
    "SELECT id FROM agents WHERE LOWER(agent_name) = LOWER(?)";

  db.query(checkQuery, [agent_name], (err, result) => {
    if (err) {
      console.error("Error checking agent:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length > 0) {
      return res.status(409).json({ message: "Agent already exists!" });
    }

    const insertQuery = `
      INSERT INTO agents
      (agent_name, agent_percent, address, country, state, city, pincode)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      agent_name,
      agent_percent,
      address || "",
      country || "",
      state || "",
      city || "",
      pincode || ""
    ];

    db.query(insertQuery, values, (err2) => {
      if (err2) {
        console.error("Error inserting agent:", err2);
        return res.status(500).json({ message: "Insert failed" });
      }
      res.json({ message: "Agent added successfully!" });
    });
  });
});

/* =========================
   PUT — Update agent
========================= */
router.put("/:id", (req, res) => {
  const { id } = req.params;

  const {
    agent_name,
    agent_percent,
    address,
    country,
    state,
    city,
    pincode
  } = req.body;

  if (!agent_name || agent_name.trim() === "") {
    return res.status(400).json({ message: "Agent name is required" });
  }

  const updateQuery = `
    UPDATE agents SET
      agent_name = ?,
      agent_percent = ?,
      address = ?,
      country = ?,
      state = ?,
      city = ?,
      pincode = ?
    WHERE id = ?
  `;

  const values = [
    agent_name,
    agent_percent,
    address || "",
    country || "",
    state || "",
    city || "",
    pincode || "",
    id
  ];

  db.query(updateQuery, values, (err) => {
    if (err) {
      console.error("Error updating agent:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "Agent updated successfully!" });
  });
});

/* =========================
   DELETE — Remove agent
========================= */
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM agents WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting agent:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "Agent deleted successfully!" });
  });
});

export default router;
