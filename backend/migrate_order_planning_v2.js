import mysql from 'mysql2';

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "14043011",
    database: "garments"
});

const run = async () => {
    try {
        // Yarn Planning
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS yarn_planning (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                fabric_name VARCHAR(255),
                yarn_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES order_planning(id) ON DELETE CASCADE
            )
        `);

        // Trims Planning
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS trims_planning (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                trims_name VARCHAR(255),
                color VARCHAR(100),
                trim_type ENUM('Sizeable', 'Non-Sizeable'),
                qty_per_pcs DECIMAL(10,3) DEFAULT 0,
                consumption_data JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES order_planning(id) ON DELETE CASCADE
            )
        `);

        // BOM
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS order_bom (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                item_category ENUM('Yarn', 'Fabric', 'Trims'),
                item_name VARCHAR(255),
                required_qty DECIMAL(10,3) DEFAULT 0,
                final_qty DECIMAL(10,3) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES order_planning(id) ON DELETE CASCADE
            )
        `);

        // Life Cycle
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS order_lifecycle (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                process_name VARCHAR(255),
                wastage_pct DECIMAL(5,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES order_planning(id) ON DELETE CASCADE
            )
        `);

        console.log('Order Planning V2 (Yarn, Trims, BOM, LifeCycle) tables created successfully');
    } catch (err) {
        console.error('Migration Error:', err);
    }
    process.exit();
};

run();
