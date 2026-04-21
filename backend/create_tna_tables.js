import db from './db.js';

const createTables = async () => {
    try {
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS tna_headers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_no VARCHAR(100) NOT NULL,
                order_name VARCHAR(200),
                customer_name VARCHAR(200),
                style_name VARCHAR(200),
                order_qty INT DEFAULT 0,
                overall_due_date DATE,
                status VARCHAR(50) DEFAULT 'In Progress',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS tna_processes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tna_id INT NOT NULL,
                sequence_no INT DEFAULT 0,
                process_name VARCHAR(100) NOT NULL,
                assigned_member_id INT,
                assigned_member_name VARCHAR(200),
                due_date DATE,
                exceptional_days INT DEFAULT 0,
                completed_qty INT DEFAULT 0,
                status ENUM('Not Started', 'In Progress', 'Completed', 'Delayed') DEFAULT 'Not Started',
                completion_date DATE,
                notes TEXT,
                FOREIGN KEY (tna_id) REFERENCES tna_headers(id) ON DELETE CASCADE
            )
        `);

        console.log("TNA Tables created successfully");
        process.exit();
    } catch (err) {
        console.error("Error creating TNA tables:", err);
        process.exit(1);
    }
};

createTables();
