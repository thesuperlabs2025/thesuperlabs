import express from "express";
import db from "../db.js";

const router = express.Router();

// Get all templates
router.get("/", async (req, res) => {
    try {
        const [templates] = await db.promise().query("SELECT * FROM lifecycle_templates ORDER BY template_name ASC");
        res.json(templates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single template with its items
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [templates] = await db.promise().query("SELECT * FROM lifecycle_templates WHERE id = ?", [id]);
        if (templates.length === 0) return res.status(404).json({ error: "Template not found" });

        const [items] = await db.promise().query("SELECT * FROM lifecycle_template_items WHERE template_id = ? ORDER BY sequence_no ASC", [id]);
        res.json({ ...templates[0], items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create/Update template
router.post("/", async (req, res) => {
    const { id, template_name, description, items } = req.body;
    const connection = await db.promise().getConnection();

    try {
        await connection.beginTransaction();

        let templateId = id;
        if (id) {
            await connection.query("UPDATE lifecycle_templates SET template_name = ?, description = ? WHERE id = ?", [template_name, description, id]);
            await connection.query("DELETE FROM lifecycle_template_items WHERE template_id = ?", [id]);
        } else {
            const [result] = await connection.query("INSERT INTO lifecycle_templates (template_name, description) VALUES (?, ?)", [template_name, description]);
            templateId = result.insertId;
        }

        if (items && items.length > 0) {
            const values = items.map((item, index) => [
                templateId,
                index + 1,
                item.process_name,
                item.process_type || null,
                item.custom_name || null,
                parseFloat(item.wastage_pct) || 0
            ]);
            await connection.query("INSERT INTO lifecycle_template_items (template_id, sequence_no, process_name, process_type, custom_name, wastage_pct) VALUES ?", [values]);
        }

        await connection.commit();
        res.json({ message: "Template saved successfully", id: templateId });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// Delete template
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.promise().query("DELETE FROM lifecycle_templates WHERE id = ?", [id]);
        res.json({ message: "Template deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
