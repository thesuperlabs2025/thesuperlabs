import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";
const router = express.Router();

// ✅ GET — Fetch all modules
router.get("/", (req, res) => {
  db.query(
    "SELECT * FROM modules ORDER BY id DESC",
    (err, data) => {
      if (err) {
        console.error("Error fetching modules:", err);
        return res.status(500).json(err);
      }
      res.json(data);
    }
  );
});

// ✅ POST — Add new module (duplicate check)
router.post("/", (req, res) => {
  const { module_name } = req.body;

  if (!module_name || module_name.trim() === "") {
    return res
      .status(400)
      .json({ message: "Module name is required" });
  }

  const checkQuery =
    "SELECT * FROM modules WHERE LOWER(module_name) = LOWER(?)";

  db.query(checkQuery, [module_name], (err, result) => {
    if (err) {
      console.error("Error checking module:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length > 0) {
      return res.status(409).json({
        message: "Module already exists!",
      });
    }

    db.query(
      "INSERT INTO modules (module_name) VALUES (?)",
      [module_name],
      (err2) => {
        if (err2) {
          console.error("Error inserting module:", err2);
          return res
            .status(500)
            .json({ message: "Insert failed" });
        }

        res.json({
          message: "Module added successfully!",
        });
      }
    );
  });
});

// ✅ PUT — Update module
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { module_name } = req.body;

  if (!module_name || module_name.trim() === "") {
    return res
      .status(400)
      .json({ message: "Module name is required" });
  }

  db.query(
    "UPDATE modules SET module_name = ? WHERE id = ?",
    [module_name, id],
    (err) => {
      if (err) {
        console.error("Error updating module:", err);
        return res.status(500).json(err);
      }

      res.json({
        message: "Module updated successfully!",
      });
    }
  );
});

// ✅ DELETE — Remove module
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM modules WHERE id = ?",
    [id],
    (err) => {
      if (err) {
        console.error("Error deleting module:", err);
        return res.status(500).json(err);
      }

      res.json({
        message: "Module deleted successfully!",
      });
    }
  );
});

export default router;
