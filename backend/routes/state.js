import express from "express";
import db from "../db.js";
const router = express.Router();

router.get("/:countryId", (req, res) => {
  db.query(
    "SELECT * FROM states WHERE country_id=?",
    [req.params.countryId],
    (e, r) => {
      if (e) return res.status(500).json(e);
      res.json(r);
    }
  );
});

router.post("/", (req, res) => {
  db.query(
    "INSERT INTO states (name, country_id) VALUES (?,?)",
    [req.body.name, req.body.country_id],
    (e) => {
      if (e) return res.status(500).json(e);
      res.json({ success: true });
    }
  );
});

router.put("/:id", (req, res) => {
  db.query(
    "UPDATE states SET name=?, country_id=? WHERE id=?",
    [req.body.name, req.body.country_id, req.params.id],
    (e) => {
      if (e) return res.status(500).json(e);
      res.json({ success: true });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM states WHERE id=?", [req.params.id], (e) => {
    if (e) return res.status(500).json(e);
    res.json({ success: true });
  });
});

export default router;
