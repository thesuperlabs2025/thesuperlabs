import express from "express";
import db from "../db.js";
const router = express.Router();

/* GET */
router.get("/", (req, res) => {
  db.query("SELECT * FROM countries ORDER BY name", (e, r) => {
    if (e) return res.status(500).json(e);
    res.json(r);
  });
});

/* ADD */
router.post("/", (req, res) => {
  db.query(
    "INSERT INTO countries (name) VALUES (?)",
    [req.body.name],
    (e, r) => {
      if (e) return res.status(500).json(e);
      res.json({ success: true });
    }
  );
});

/* UPDATE */
router.put("/:id", (req, res) => {
  db.query(
    "UPDATE countries SET name=? WHERE id=?",
    [req.body.name, req.params.id],
    (e) => {
      if (e) return res.status(500).json(e);
      res.json({ success: true });
    }
  );
});

/* DELETE */
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM countries WHERE id=?", [req.params.id], (e) => {
    if (e) return res.status(500).json(e);
    res.json({ success: true });
  });
});

export default router;
