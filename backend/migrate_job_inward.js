import db from "./db.js";

const queries = [
    "CREATE TABLE IF NOT EXISTS processes (id INT AUTO_INCREMENT PRIMARY KEY, process_name VARCHAR(255) NOT NULL UNIQUE)",
    "CREATE TABLE IF NOT EXISTS machines (id INT AUTO_INCREMENT PRIMARY KEY, machine_name VARCHAR(255) NOT NULL UNIQUE)",
    "CREATE TABLE IF NOT EXISTS job_inward (id INT AUTO_INCREMENT PRIMARY KEY, grn_no VARCHAR(50), company_name VARCHAR(255), inward_from VARCHAR(255), order_no VARCHAR(255), job_no VARCHAR(255), create_date DATE, type VARCHAR(50), fabric_in_charge VARCHAR(255), fabric_received_condition VARCHAR(255), approval_status VARCHAR(50) DEFAULT 'Pending')",
    "CREATE TABLE IF NOT EXISTS job_inward_items (id INT AUTO_INCREMENT PRIMARY KEY, inward_id INT, fabric_name VARCHAR(255), colour VARCHAR(255), dia VARCHAR(50), roll VARCHAR(50), received_weight VARCHAR(50), FOREIGN KEY (inward_id) REFERENCES job_inward(id) ON DELETE CASCADE)",
    "CREATE TABLE IF NOT EXISTS job_inward_item_processes (id INT AUTO_INCREMENT PRIMARY KEY, item_id INT, process_name VARCHAR(255), machine_name VARCHAR(255), FOREIGN KEY (item_id) REFERENCES job_inward_items(id) ON DELETE CASCADE)"
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
