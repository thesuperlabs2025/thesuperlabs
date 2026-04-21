import db from "./db.js";

const queries = [
    `CREATE TABLE IF NOT EXISTS garment_costing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_planning_id INT,
        buyer_id INT,
        buyer_name VARCHAR(255),
        style_no VARCHAR(100),
        description TEXT,
        order_qty INT,
        currency VARCHAR(20) DEFAULT 'INR',
        target_fob DECIMAL(15, 2),
        status ENUM('Draft', 'Approved') DEFAULT 'Draft',
        cm_cost DECIMAL(15, 2) DEFAULT 0.00,
        overhead_pct DECIMAL(5, 2) DEFAULT 5.00,
        profit_pct DECIMAL(5, 2) DEFAULT 10.00,
        total_fabrics_cost DECIMAL(15, 2) DEFAULT 0.00,
        total_trims_cost DECIMAL(15, 2) DEFAULT 0.00,
        total_processing_cost DECIMAL(15, 2) DEFAULT 0.00,
        total_cost DECIMAL(15, 2) DEFAULT 0.00,
        final_fob DECIMAL(15, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_planning_id) REFERENCES order_planning(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS garment_costing_fabrics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        costing_id INT,
        fabric_name VARCHAR(255),
        cons_kg_pc DECIMAL(15, 4),
        rate_kg DECIMAL(15, 2),
        total_cost DECIMAL(15, 2),
        FOREIGN KEY (costing_id) REFERENCES garment_costing(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS garment_costing_trims (
        id INT AUTO_INCREMENT PRIMARY KEY,
        costing_id INT,
        trim_name VARCHAR(255),
        cost_pc DECIMAL(15, 4),
        total_cost DECIMAL(15, 2),
        FOREIGN KEY (costing_id) REFERENCES garment_costing(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS garment_costing_processes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        costing_id INT,
        process_name VARCHAR(255),
        cost_pc DECIMAL(15, 4),
        FOREIGN KEY (costing_id) REFERENCES garment_costing(id) ON DELETE CASCADE
    )`
];

const runQueries = async () => {
    for (const sql of queries) {
        try {
            await db.promise().query(sql);
            console.log("Query executed successfully");
        } catch (err) {
            console.error("Error executing query:", err);
        }
    }
    process.exit();
};

runQueries();
