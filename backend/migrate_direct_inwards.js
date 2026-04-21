import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const db = mysql.createConnection({
    host: process.env.HOST || "localhost",
    user: process.env.USER || "root",
    password: process.env.PASSWORD || "14043011", // Fallback to provided password
    database: process.env.DATABASE || "garments"
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to database for Migration");

    const queries = [
        // 1. Direct Inward
        `CREATE TABLE IF NOT EXISTS direct_inward (
            id INT AUTO_INCREMENT PRIMARY KEY,
            inward_no VARCHAR(50) UNIQUE NOT NULL,
            supplier_name VARCHAR(255),
            inward_date DATE,
            staff_name VARCHAR(255),
            remarks TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS direct_inward_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            inward_id INT,
            item_name VARCHAR(255),
            qty DECIMAL(10,2),
            FOREIGN KEY (inward_id) REFERENCES direct_inward(id) ON DELETE CASCADE
        )`,

        // 2. Yarn Inward
        `CREATE TABLE IF NOT EXISTS yarn_direct_inward (
            id INT AUTO_INCREMENT PRIMARY KEY,
            inward_no VARCHAR(50) UNIQUE NOT NULL,
            supplier_name VARCHAR(255),
            inward_date DATE,
            staff_name VARCHAR(255),
            remarks TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS yarn_direct_inward_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            inward_id INT,
            yarn_name VARCHAR(255),
            qty DECIMAL(10,2),
            FOREIGN KEY (inward_id) REFERENCES yarn_direct_inward(id) ON DELETE CASCADE
        )`,

        // 3. Fabric Inward
        `CREATE TABLE IF NOT EXISTS fabric_direct_inward (
            id INT AUTO_INCREMENT PRIMARY KEY,
            inward_no VARCHAR(50) UNIQUE NOT NULL,
            supplier_name VARCHAR(255),
            inward_date DATE,
            staff_name VARCHAR(255),
            remarks TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS fabric_direct_inward_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            inward_id INT,
            fabric_name VARCHAR(255),
            qty DECIMAL(10,2),
            FOREIGN KEY (inward_id) REFERENCES fabric_direct_inward(id) ON DELETE CASCADE
        )`,

        // 4. Trims Inward
        `CREATE TABLE IF NOT EXISTS trims_direct_inward (
            id INT AUTO_INCREMENT PRIMARY KEY,
            inward_no VARCHAR(50) UNIQUE NOT NULL,
            supplier_name VARCHAR(255),
            inward_date DATE,
            staff_name VARCHAR(255),
            remarks TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS trims_direct_inward_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            inward_id INT,
            trims_name VARCHAR(255),
            qty DECIMAL(10,2),
            FOREIGN KEY (inward_id) REFERENCES trims_direct_inward(id) ON DELETE CASCADE
        )`,

        // 5. Pcs Inward (using pcs_direct_inward to avoid conflict)
        `CREATE TABLE IF NOT EXISTS pcs_direct_inward (
            id INT AUTO_INCREMENT PRIMARY KEY,
            inward_no VARCHAR(50) UNIQUE NOT NULL,
            supplier_name VARCHAR(255),
            inward_date DATE,
            staff_name VARCHAR(255),
            remarks TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS pcs_direct_inward_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            inward_id INT,
            style_name VARCHAR(255),
            size VARCHAR(50),
            qty DECIMAL(10,2),
            FOREIGN KEY (inward_id) REFERENCES pcs_direct_inward(id) ON DELETE CASCADE
        )`
    ];

    let completed = 0;
    const runQuery = (index) => {
        if (index >= queries.length) {
            console.log("All Inward tables created.");
            db.end();
            process.exit(0);
        }
        db.query(queries[index], (err) => {
            if (err) {
                console.error("Error executing query:", queries[index], err);
                process.exit(1);
            }
            console.log(`Query ${index + 1} executed.`);
            runQuery(index + 1);
        });
    };

    runQuery(0);
});
