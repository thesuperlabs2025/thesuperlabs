import express from "express";
import db from "../db.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Setup Multer for reference images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `lead_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// Get all leads
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM leads ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

// Get next lead ID
router.get("/next-id", async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT lead_id FROM leads ORDER BY id DESC LIMIT 1");
        let nextId = "1";
        if (rows.length > 0) {
            const lastId = rows[0].lead_id;
            // Strip any non-digit characters to handle transition from LD-xxxx to numeric
            const lastNum = parseInt(lastId.replace(/\D/g, "")) || 0;
            nextId = (lastNum + 1).toString();
        }
        res.json({ nextId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

// Get single lead
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM leads WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Lead not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

// Create lead
router.post("/", upload.single("reference_image"), async (req, res) => {
    const data = req.body;
    const referenceImage = req.file ? req.file.filename : null;

    const query = `
        INSERT INTO leads (
            lead_id, lead_date, company_name, contact_person, mobile_number, 
            whatsapp_number, email_id, city, state, country, lead_source, 
            assigned_sales_person, product_type, appointment_date, reference_image, 
            gst_number, address, lead_status, next_followup_date, followup_notes, 
            expected_closing_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.lead_id, data.lead_date, data.company_name, data.contact_person, data.mobile_number,
        data.whatsapp_number, data.email_id, data.city, data.state, data.country, data.lead_source,
        data.assigned_sales_person, data.product_type, data.appointment_date || null, referenceImage,
        data.gst_number, data.address, data.lead_status || 'New', data.next_followup_date || null,
        data.followup_notes, data.expected_closing_date || null
    ];

    try {
        const [result] = await db.promise().query(query, values);
        res.json({ message: "Lead created successfully", id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
});

// Update lead
router.put("/:id", upload.single("reference_image"), async (req, res) => {
    const data = req.body;
    const referenceImage = req.file ? req.file.filename : data.reference_image;

    const query = `
        UPDATE leads SET 
            lead_date = ?, company_name = ?, contact_person = ?, mobile_number = ?, 
            whatsapp_number = ?, email_id = ?, city = ?, state = ?, country = ?, 
            lead_source = ?, assigned_sales_person = ?, product_type = ?, 
            appointment_date = ?, reference_image = ?, gst_number = ?, 
            address = ?, lead_status = ?, next_followup_date = ?, 
            followup_notes = ?, expected_closing_date = ?
        WHERE id = ?
    `;

    const values = [
        data.lead_date, data.company_name, data.contact_person, data.mobile_number,
        data.whatsapp_number, data.email_id, data.city, data.state, data.country,
        data.lead_source, data.assigned_sales_person, data.product_type,
        data.appointment_date || null, referenceImage, data.gst_number,
        data.address, data.lead_status, data.next_followup_date || null,
        data.followup_notes, data.expected_closing_date || null,
        req.params.id
    ];

    try {
        await db.promise().query(query, values);
        res.json({ message: "Lead updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

// Delete lead
router.delete("/:id", async (req, res) => {
    try {
        await db.promise().query("DELETE FROM leads WHERE id = ?", [req.params.id]);
        res.json({ message: "Lead deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

export default router;
