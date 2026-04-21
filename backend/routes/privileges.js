import express from "express";
import db from "../db.js";

const router = express.Router();

// GET privileges for a user type
router.get("/:usertypeId", (req, res) => {
  const q = `
    SELECT 
      m.id AS module_id,
      m.module_name,
      IFNULL(p.can_add,0) AS can_add,
      IFNULL(p.can_update,0) AS can_update,
      IFNULL(p.can_delete,0) AS can_delete,
      IFNULL(p.can_view,1) AS can_view,
      IFNULL(p.can_print,0) AS can_print
    FROM modules m
    LEFT JOIN privileges p
      ON p.module_id = m.id
      AND p.usertype_id = ?
  `;

  db.query(q, [req.params.usertypeId], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

// Save / update privilege
router.post("/", (req, res) => {
  const {
    usertype_id,
    module_id,
    can_add,
    can_update,
    can_delete,
    can_view,
    can_print
  } = req.body;

  const q = `
    INSERT INTO privileges
    (usertype_id, module_id, can_add, can_update, can_delete, can_view, can_print)
    VALUES (?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
      can_add = VALUES(can_add),
      can_update = VALUES(can_update),
      can_delete = VALUES(can_delete),
      can_view = VALUES(can_view),
      can_print = VALUES(can_print)
  `;

  db.query(
    q,
    [usertype_id, module_id, can_add, can_update, can_delete, can_view, can_print],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Privilege saved successfully" });
    }
  );
});

export default router;
