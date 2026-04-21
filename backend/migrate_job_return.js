import db from "./db.js";

const queries = [
    `CREATE TABLE IF NOT EXISTS job_return (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inward_id INT,
        company_name VARCHAR(255),
        return_from VARCHAR(255),
        in_dc_no VARCHAR(50),
        order_no VARCHAR(255),
        job_card_no VARCHAR(255),
        contact_no VARCHAR(20),
        create_date DATE,
        return_type ENUM('Full Return', 'Partial Return') DEFAULT 'Full Return',
        fabric_in_charge VARCHAR(255),
        fabric_received_condition VARCHAR(255),
        roll_reverse VARCHAR(255),
        lab_report VARCHAR(255),
        design_no VARCHAR(255),
        same_for_all BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inward_id) REFERENCES job_inward(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS job_return_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        return_id INT,
        inward_item_id INT,
        fabric_name VARCHAR(255),
        colour VARCHAR(255),
        dia VARCHAR(50),
        roll VARCHAR(50),
        inward_weight DECIMAL(10, 2),
        return_weight DECIMAL(10, 2),
        rate DECIMAL(10, 2) DEFAULT 0,
        amount DECIMAL(10, 2) DEFAULT 0,
        cgst_pct DECIMAL(5, 2) DEFAULT 0,
        cgst_amt DECIMAL(10, 2) DEFAULT 0,
        sgst_pct DECIMAL(5, 2) DEFAULT 0,
        sgst_amt DECIMAL(10, 2) DEFAULT 0,
        FOREIGN KEY (return_id) REFERENCES job_return(id) ON DELETE CASCADE,
        FOREIGN KEY (inward_item_id) REFERENCES job_inward_items(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS job_return_item_processes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        return_item_id INT,
        process_name VARCHAR(255),
        machine_name VARCHAR(255),
        FOREIGN KEY (return_item_id) REFERENCES job_return_items(id) ON DELETE CASCADE
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
            console.log("Success executing query");
        } catch (err) {
            console.error("Error executing query:", err.message);
        }
    }
    process.exit();
};

runMigration();
