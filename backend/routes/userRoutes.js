import express from "express";
import db from "../db.js";
import bcrypt from "bcryptjs";

const router = express.Router();

/* ============================
   GET ALL USERS
============================ */
router.get("/", (req, res) => {
  db.query("SELECT id, username, name, email, role FROM users", (err, data) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json(err);
    }
    res.json(data);
  });
});

/* ============================
   GET ONE USER
============================ */
router.get("/:id", (req, res) => {
  db.query(
    "SELECT id, username, name, email, role FROM users WHERE id = ?",
    [req.params.id],
    (err, data) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.status(500).json(err);
      }
      res.json(data[0]);
    }
  );
});

/* ============================
   CREATE USER (WITH DUPLICATE CHECK)
============================ */
router.post("/", (req, res) => {
  const { username, password, name, email, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // 🔹 Check duplicate username
  const checkSql = "SELECT id FROM users WHERE username = ?";
  db.query(checkSql, [username], (err, result) => {
    if (err) {
      console.error("Username check error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length > 0) {
      return res
        .status(409)
        .json({ error: "Username already exists!" });
    }

    // 🔹 Hash password
    const hash = bcrypt.hashSync(password, 10);

    const insertSql =
      "INSERT INTO users (username, password, name, email, role) VALUES (?,?,?,?,?)";

    db.query(
      insertSql,
      [username, hash, name, email, role],
      (err2) => {
        if (err2) {
          console.error("User insert error:", err2);
          return res.status(500).json({ error: "Insert failed" });
        }
        res.json({ message: "User created successfully!" });
      }
    );
  });
});

/* ============================
   UPDATE USER
============================ */
router.put("/:id", (req, res) => {
  const { username, name, email, role, password } = req.body;
  const { id } = req.params;

  const checkSql =
    "SELECT id FROM users WHERE username = ? AND id != ?";
  db.query(checkSql, [username, id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (result.length > 0) {
      return res.status(409).json({ error: "Username already exists!" });
    }

    let updateSql =
      "UPDATE users SET username=?, name=?, email=?, role=?";
    let params = [username, name, email, role];

    // 🔹 Update password only if provided
    if (password && password.trim() !== "") {
      const hash = bcrypt.hashSync(password, 10);
      updateSql += ", password=?";
      params.push(hash);
    }

    updateSql += " WHERE id=?";
    params.push(id);

    db.query(updateSql, params, (err2) => {
      if (err2) return res.status(500).json(err2);
      res.json({ message: "User updated successfully!" });
    });
  });
});


/* ============================
   DELETE USER
============================ */
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      console.error("Delete user error:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "User deleted successfully!" });
  });
});

export default router;
