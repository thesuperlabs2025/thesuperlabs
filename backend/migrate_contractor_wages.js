import mysql from 'mysql2';

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "14043011",
    database: "garments"
});

const run = async () => {
    try {
        console.log('Creating contractor_wages tables...');

        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS contractor_wages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                order_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS contractor_wages_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                contractor_wages_id INT,
                style_name VARCHAR(255),
                color VARCHAR(100),
                contractor VARCHAR(255),
                process VARCHAR(255),
                qty DECIMAL(10,3) DEFAULT 0,
                rate DECIMAL(10,2) DEFAULT 0,
                total_rate DECIMAL(12,2) DEFAULT 0,
                FOREIGN KEY (contractor_wages_id) REFERENCES contractor_wages(id) ON DELETE CASCADE
            )
        `);

        console.log('Contractor Wages tables created successfully');
    } catch (err) {
        console.error('Migration Error:', err);
    }
    process.exit();
};

run();
