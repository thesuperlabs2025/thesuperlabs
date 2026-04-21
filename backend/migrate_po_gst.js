import db from "./db.js";

const sqls = [
    // 1. Update general_po
    "ALTER TABLE general_po ADD COLUMN IF NOT EXISTS is_order_specific TINYINT(1) DEFAULT 0",
    "ALTER TABLE general_po ADD COLUMN IF NOT EXISTS is_lot_specific TINYINT(1) DEFAULT 0",
    "ALTER TABLE general_po ADD COLUMN IF NOT EXISTS order_id INT DEFAULT NULL",
    "ALTER TABLE general_po ADD COLUMN IF NOT EXISTS order_no VARCHAR(100) DEFAULT NULL",
    "ALTER TABLE general_po ADD COLUMN IF NOT EXISTS order_name VARCHAR(255) DEFAULT NULL",
    "ALTER TABLE general_po ADD COLUMN IF NOT EXISTS lot_no VARCHAR(100) DEFAULT NULL",
    "ALTER TABLE general_po ADD COLUMN IF NOT EXISTS lot_name VARCHAR(255) DEFAULT NULL",
    "ALTER TABLE general_po ADD COLUMN IF NOT EXISTS is_igst TINYINT(1) DEFAULT 0",
    "ALTER TABLE general_po ADD COLUMN IF NOT EXISTS round_off DECIMAL(10,2) DEFAULT 0.00",

    // 2. Update garments_po
    "ALTER TABLE garments_po ADD COLUMN IF NOT EXISTS is_order_specific TINYINT(1) DEFAULT 1", // Usually order specific
    "ALTER TABLE garments_po ADD COLUMN IF NOT EXISTS is_lot_specific TINYINT(1) DEFAULT 0",
    "ALTER TABLE garments_po ADD COLUMN IF NOT EXISTS lot_no VARCHAR(100) DEFAULT NULL",
    "ALTER TABLE garments_po ADD COLUMN IF NOT EXISTS lot_name VARCHAR(255) DEFAULT NULL",
    "ALTER TABLE garments_po ADD COLUMN IF NOT EXISTS is_igst TINYINT(1) DEFAULT 0",
    "ALTER TABLE garments_po ADD COLUMN IF NOT EXISTS round_off DECIMAL(10,2) DEFAULT 0.00",

    // 3. Update other POs
    "ALTER TABLE yarn_po ADD COLUMN IF NOT EXISTS is_igst TINYINT(1) DEFAULT 0",
    "ALTER TABLE yarn_po ADD COLUMN IF NOT EXISTS round_off DECIMAL(10,2) DEFAULT 0.00",
    "ALTER TABLE fabric_po ADD COLUMN IF NOT EXISTS is_igst TINYINT(1) DEFAULT 0",
    "ALTER TABLE fabric_po ADD COLUMN IF NOT EXISTS round_off DECIMAL(10,2) DEFAULT 0.00",
    "ALTER TABLE trims_po ADD COLUMN IF NOT EXISTS is_igst TINYINT(1) DEFAULT 0",
    "ALTER TABLE trims_po ADD COLUMN IF NOT EXISTS round_off DECIMAL(10,2) DEFAULT 0.00",

    // 4. Update item tables
    "ALTER TABLE yarn_po_items ADD COLUMN IF NOT EXISTS gst_per DECIMAL(10,2) DEFAULT 0.00",
    "ALTER TABLE yarn_po_items ADD COLUMN IF NOT EXISTS total DECIMAL(15,2) DEFAULT 0.00",

    "ALTER TABLE fabric_po_items ADD COLUMN IF NOT EXISTS gst_per DECIMAL(10,2) DEFAULT 0.00",
    "ALTER TABLE fabric_po_items ADD COLUMN IF NOT EXISTS total DECIMAL(15,2) DEFAULT 0.00",

    "ALTER TABLE trims_po_items ADD COLUMN IF NOT EXISTS gst_per DECIMAL(10,2) DEFAULT 0.00",
    "ALTER TABLE trims_po_items ADD COLUMN IF NOT EXISTS total DECIMAL(15,2) DEFAULT 0.00",

    "ALTER TABLE garments_po_items ADD COLUMN IF NOT EXISTS rate DECIMAL(10,2) DEFAULT 0.00",
    "ALTER TABLE garments_po_items ADD COLUMN IF NOT EXISTS gst_per DECIMAL(10,2) DEFAULT 0.00",
    "ALTER TABLE garments_po_items ADD COLUMN IF NOT EXISTS total DECIMAL(15,2) DEFAULT 0.00",

    "ALTER TABLE general_po_items ADD COLUMN IF NOT EXISTS rate DECIMAL(10,2) DEFAULT 0.00",
    "ALTER TABLE general_po_items ADD COLUMN IF NOT EXISTS gst_per DECIMAL(10,2) DEFAULT 0.00",
    "ALTER TABLE general_po_items ADD COLUMN IF NOT EXISTS total DECIMAL(15,2) DEFAULT 0.00"
];

async function run() {
    for (const sql of sqls) {
        console.log(`Executing: ${sql}`);
        await new Promise((resolve) => {
            db.query(sql, (err, result) => {
                if (err) {
                    // Ignore "Duplicate column name" error if IF NOT EXISTS fails (older MySQL)
                    if (err.code === 'ER_DUP_FIELDNAME') {
                        console.log("Column already exists, skipping...");
                    } else {
                        console.error("Error:", err.message);
                    }
                } else {
                    console.log("Success!");
                }
                resolve();
            });
        });
    }
    process.exit();
}

run();
