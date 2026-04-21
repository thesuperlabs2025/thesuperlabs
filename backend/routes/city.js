import express from "express";
import db from "../db.js";
const router = express.Router();

router.get("/:stateId", (req, res) => {
  db.query(
    "SELECT * FROM cities WHERE state_id=?",
    [req.params.stateId],
    (e, r) => {
      if (e) return res.status(500).json(e);
      res.json(r);
    }
  );
});

router.post("/", (req, res) => {
  db.query(
    "INSERT INTO cities (name, state_id) VALUES (?,?)",
    [req.body.name, req.body.state_id],
    (e) => {
      if (e) return res.status(500).json(e);
      res.json({ success: true });
    }
  );
});

router.put("/:id", (req, res) => {
  db.query(
    "UPDATE cities SET name=?, state_id=? WHERE id=?",
    [req.body.name, req.body.state_id, req.params.id],
    (e) => {
      if (e) return res.status(500).json(e);
      res.json({ success: true });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM cities WHERE id=?", [req.params.id], (e) => {
    if (e) return res.status(500).json(e);
    res.json({ success: true });
  });
});

export default router;
