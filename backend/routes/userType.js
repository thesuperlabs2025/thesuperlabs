import express from "express";
import db from "../db.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// ✅ GET — Fetch all user types
router.get("/", (req, res) => {
  db.query("SELECT * FROM user_types ORDER BY id DESC", (err, data) => {
    if (err) {
      console.error("Error fetching user types:", err);
      return res.status(500).json(err);
    }
    res.json(data);
  });
});

// ✅ POST — Add new user type (with duplicate check)
router.post("/", (req, res) => {
  const { role } = req.body;

  if (!role || role.trim() === "") {
    return res.status(400).json({ message: "User type is required" });
  }

  const checkQuery =
    "SELECT * FROM user_types WHERE LOWER(role) = LOWER(?)";

  db.query(checkQuery, [role], (err, result) => {
    if (err) {
      console.error("Error checking user type:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length > 0) {
      return res
        .status(409)
        .json({ message: "User type already exists!" });
    }

    db.query(
      "INSERT INTO user_types (role) VALUES (?)",
      [role],
      (err2) => {
        if (err2) {
          console.error("Error inserting user type:", err2);
          return res.status(500).json({ message: "Insert failed" });
        }
        res.json({ message: "User type added successfully!" });
      }
    );
  });
});

// ✅ PUT — Update user type
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || role.trim() === "") {
    return res.status(400).json({ message: "User type is required" });
  }

  db.query(
    "UPDATE user_types SET role = ? WHERE id = ?",
    [role, id],
    (err) => {
      if (err) {
        console.error("Error updating user type:", err);
        return res.status(500).json(err);
      }
      res.json({ message: "User type updated successfully!" });
    }
  );
});

// ✅ DELETE — Remove user type
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM user_types WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting user type:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "User type deleted successfully!" });
  });
});

export default router;
