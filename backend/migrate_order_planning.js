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
    const connection = await mysql.createConnection(connectionConfig);
    console.log('Connected to database.');

    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS order_planning (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_no VARCHAR(50) UNIQUE,
                order_type VARCHAR(50),
                own_brand_name VARCHAR(100),
                buyer_id INT,
                buyer_name VARCHAR(100),
                buyer_po VARCHAR(100),
                order_name VARCHAR(200),
                order_category VARCHAR(50),
                style_type VARCHAR(100) DEFAULT 'new style planning',
                season_id INT,
                season_name VARCHAR(100),
                merchandiser_id INT,
                merchandiser_name VARCHAR(100),
                priority VARCHAR(20),
                order_date DATE,
                factory_date DATE,
                delivery_date DATE,
                lifecycle_type VARCHAR(50) DEFAULT 'not planned',
                is_bundle VARCHAR(20) DEFAULT 'no',
                status VARCHAR(20) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await connection.query(createTableQuery);
        console.log('Table "order_planning" created or already exists.');

    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await connection.end();
        console.log('Connection closed.');
    }
}

migrate();
