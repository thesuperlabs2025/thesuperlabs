
import mysql from "mysql2";

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "14043011",
    database: "garments"
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to database");

    const queries = [
        // Yarn GRN
        `CREATE TABLE IF NOT EXISTS yarn_grn (
            id INT AUTO_INCREMENT PRIMARY KEY,
            grn_no VARCHAR(50) UNIQUE NOT NULL,
            supplier_name VARCHAR(255),
            grn_date DATETIME,
            dc_no VARCHAR(100),
            dc_date DATETIME,
            staff_name VARCHAR(255),
            is_order_specific BOOLEAN DEFAULT FALSE,
            is_lot_specific BOOLEAN DEFAULT FALSE,
            order_id INT,
            order_no VARCHAR(100),
            order_name VARCHAR(255),
            lot_no VARCHAR(100),
            lot_name VARCHAR(255),
            remarks TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS yarn_grn_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            grn_id INT,
            counts VARCHAR(100),
            yarn_name VARCHAR(255),
            color VARCHAR(100),
            per_bag DECIMAL(10,2),
            per_bag_qty DECIMAL(10,2),
            qty DECIMAL(10,2),
            FOREIGN KEY (grn_id) REFERENCES yarn_grn(id) ON DELETE CASCADE
        )`,

        // Fabric GRN
        `CREATE TABLE IF NOT EXISTS fabric_grn (
            id INT AUTO_INCREMENT PRIMARY KEY,
            grn_no VARCHAR(50) UNIQUE NOT NULL,
            supplier_name VARCHAR(255),
            grn_date DATETIME,
            dc_no VARCHAR(100),
            dc_date DATETIME,
            staff_name VARCHAR(255),
            is_order_specific BOOLEAN DEFAULT FALSE,
            is_lot_specific BOOLEAN DEFAULT FALSE,
            order_id INT,
            order_no VARCHAR(100),
            order_name VARCHAR(255),
            lot_no VARCHAR(100),
            lot_name VARCHAR(255),
            remarks TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS fabric_grn_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            grn_id INT,
            counts VARCHAR(100),
            fabric_name VARCHAR(255),
            color VARCHAR(100),
            gsm VARCHAR(50),
            dia VARCHAR(50),
            rolls INT,
            qty DECIMAL(10,2),
            FOREIGN KEY (grn_id) REFERENCES fabric_grn(id) ON DELETE CASCADE
        )`,

        // Trims GRN
        `CREATE TABLE IF NOT EXISTS trims_grn (
            id INT AUTO_INCREMENT PRIMARY KEY,
            grn_no VARCHAR(50) UNIQUE NOT NULL,
            supplier_name VARCHAR(255),
            grn_date DATETIME,
            dc_no VARCHAR(100),
            dc_date DATETIME,
            staff_name VARCHAR(255),
            is_order_specific BOOLEAN DEFAULT FALSE,
            is_lot_specific BOOLEAN DEFAULT FALSE,
            order_id INT,
            order_no VARCHAR(100),
            order_name VARCHAR(255),
            lot_no VARCHAR(100),
            lot_name VARCHAR(255),
            remarks TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS trims_grn_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            grn_id INT,
            trims_name VARCHAR(255),
            color VARCHAR(100),
            size VARCHAR(50),
            qty DECIMAL(10,2),
            FOREIGN KEY (grn_id) REFERENCES trims_grn(id) ON DELETE CASCADE
        )`,

        // Garments GRN
        `CREATE TABLE IF NOT EXISTS garments_grn (
            id INT AUTO_INCREMENT PRIMARY KEY,
            grn_no VARCHAR(50) UNIQUE NOT NULL,
            supplier_name VARCHAR(255),
            grn_date DATETIME,
            dc_no VARCHAR(100),
            dc_date DATETIME,
            staff_name VARCHAR(255),
            order_id INT,
            order_no VARCHAR(100),
            order_name VARCHAR(255),
            remarks TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS garments_grn_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            grn_id INT,
            style_name VARCHAR(255),
            color VARCHAR(100),
            size VARCHAR(50),
            qty DECIMAL(10,2),
            FOREIGN KEY (grn_id) REFERENCES garments_grn(id) ON DELETE CASCADE
        )`,

        // General GRN
        `CREATE TABLE IF NOT EXISTS general_grn (
            id INT AUTO_INCREMENT PRIMARY KEY,
            grn_no VARCHAR(50) UNIQUE NOT NULL,
            supplier_name VARCHAR(255),
            grn_date DATETIME,
            dc_no VARCHAR(100),
            dc_date DATETIME,
            staff_name VARCHAR(255),
            grn_type VARCHAR(50),
            remarks TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS general_grn_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            grn_id INT,
            counts VARCHAR(100),
            yarn_name VARCHAR(255),
            fabric_name VARCHAR(255),
            trims_name VARCHAR(255),
            color VARCHAR(100),
            size VARCHAR(50),
            gsm VARCHAR(50),
            dia VARCHAR(50),
            per_bag DECIMAL(10,2),
            per_bag_qty DECIMAL(10,2),
            rolls INT,
            qty DECIMAL(10,2),
            FOREIGN KEY (grn_id) REFERENCES general_grn(id) ON DELETE CASCADE
        )`
    ];

    let completed = 0;

    // Execute sequentially to avoid connection issues or async mess
    const runQuery = (index) => {
        if (index >= queries.length) {
            console.log("All GRN tables created/verified.");
            db.end();
            process.exit(0); // Ensure process exits
            return;
        }

        db.query(queries[index], (err, result) => {
            if (err) {
                console.error("Error creating table:", err);
                db.end();
                process.exit(1);
                return;
            }
            console.log(`Table query ${index + 1} executed.`);
            runQuery(index + 1);
        });
    };

    runQuery(0);
});
