import mysql from 'mysql2';

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "14043011",
    database: "garments"
});

const run = async () => {
    try {
        console.log("Creating lifecycle template tables...");

        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS lifecycle_templates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                template_name VARCHAR(255) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Table lifecycle_templates created");

        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS lifecycle_template_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                template_id INT NOT NULL,
                sequence_no INT DEFAULT 0,
                process_name VARCHAR(255),
                process_type VARCHAR(50),
                custom_name VARCHAR(255),
                wastage_pct DECIMAL(10, 2) DEFAULT 0,
                FOREIGN KEY (template_id) REFERENCES lifecycle_templates(id) ON DELETE CASCADE
            )
        `);
        console.log("Table lifecycle_template_items created");

        console.log("Migration completed successfully!");
    } catch (err) {
        console.error('Migration Error:', err);
    }
    process.exit();
};

run();
