import db from "./db.js";

// Migration: Create yarn_dyeing_outward tables for all 3 types
const queries = [
    `CREATE TABLE IF NOT EXISTS yarn_dyeing_outward (
        id INT AUTO_INCREMENT PRIMARY KEY,
        outward_no VARCHAR(50) UNIQUE,
        outward_type ENUM('order','lot','internal') NOT NULL DEFAULT 'order',
        outward_date DATE,
        ref_no VARCHAR(50),
        order_no VARCHAR(100),
        order_name VARCHAR(255),
        lot_no VARCHAR(100),
        lot_name VARCHAR(255),
        internal_lot_no VARCHAR(100),
        internal_lot_name VARCHAR(255),
        party_name VARCHAR(255),
        process VARCHAR(100) DEFAULT 'Yarn Dyeing',
        remarks TEXT,
        total_qty DECIMAL(12,3) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS yarn_dyeing_outward_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        outward_id INT NOT NULL,
        yarn_name VARCHAR(255),
        counts VARCHAR(100),
        color VARCHAR(100),
        qty DECIMAL(12,3) DEFAULT 0,
        FOREIGN KEY (outward_id) REFERENCES yarn_dyeing_outward(id) ON DELETE CASCADE
    )`
];

const runMigration = async () => {
    for (const q of queries) {
        try {
            await new Promise((resolve, reject) => {
                db.query(q, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            console.log("✅ Success:", q.substring(0, 60));
        } catch (err) {
            console.error("❌ Error:", err.message);
        }
    }
    process.exit();
};

runMigration();
