import express from "express";
import db from "../db.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer Config for Logo Upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// GET company profile
router.get("/", (req, res) => {
    db.query("SELECT * FROM company_profile LIMIT 1", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result[0] || {});
    });
});

// UPDATE company profile (including logo)
router.put("/", upload.single('logo'), (req, res) => {
    const {
        company_name,
        gst_no,
        mobile,
        email,
        address,
        pincode,
        bank_name,
        account_name,
        ifsc_code,
        account_number
    } = req.body;

    let logo = req.body.logo; // Keep existing logo if no new file
    if (req.file) {
        logo = req.file.filename;
    }

    const query = `
        UPDATE company_profile SET 
        company_name = ?, gst_no = ?, mobile = ?, email = ?, 
        address = ?, pincode = ?, bank_name = ?, account_name = ?, 
        ifsc_code = ?, account_number = ?, logo = ?
        WHERE id = 1
    `;

    const values = [
        company_name, gst_no, mobile, email,
        address, pincode, bank_name, account_name,
        ifsc_code, account_number, logo
    ];

    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Company profile updated successfully" });
    });
});

export default router;
