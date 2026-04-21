import db from "./db.js";

const queries = [
    `CREATE TABLE IF NOT EXISTS internal_lots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        internal_lot_no VARCHAR(50) UNIQUE NOT NULL,
        internal_lot_name VARCHAR(255) NOT NULL,
        status ENUM('Pending', 'Approved', 'Hold', 'Completed') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
