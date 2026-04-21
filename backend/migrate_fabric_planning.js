import mysql from 'mysql2';

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "14043011",
    database: "garments"
});

const run = async () => {
    try {
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS fabric_planning (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES order_planning(id) ON DELETE CASCADE
            )
        `);

        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS fabric_planning_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fabric_planning_id INT,
                style_part VARCHAR(50),
                body_part VARCHAR(100),
                fabric_name VARCHAR(255),
                gsm VARCHAR(50),
                dia VARCHAR(100),
                color VARCHAR(100),
                composition VARCHAR(255),
                counts VARCHAR(100),
                consumption_data JSON,
                avg_wt DECIMAL(10,3) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (fabric_planning_id) REFERENCES fabric_planning(id) ON DELETE CASCADE
            )
        `);

        console.log('Fabric Planning tables created successfully');
    } catch (err) {
        console.error('Migration Error:', err);
    }
    process.exit();
};

run();
