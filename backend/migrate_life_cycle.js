import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '14043011',
    database: process.env.DB_NAME || 'garments'
};

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection(connectionConfig);
        console.log('Connected to database.');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS life_cycles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                process_name VARCHAR(255) NOT NULL,
                process_type VARCHAR(50) NOT NULL, -- yarn, fabric, pcs
                wastage DECIMAL(10, 2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Table "life_cycles" checked/created.');

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
