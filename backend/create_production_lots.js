import db from "./db.js";

const queries = [
    `CREATE TABLE IF NOT EXISTS production_lots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lot_no VARCHAR(50) UNIQUE NOT NULL,
        lot_name VARCHAR(255) NOT NULL,
        status ENUM('Pending', 'Approved', 'Hold', 'Completed') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS production_lot_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lot_id INT,
        order_planning_id INT,
        order_no VARCHAR(50),
        order_date DATE,
        FOREIGN KEY (lot_id) REFERENCES production_lots(id) ON DELETE CASCADE
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
