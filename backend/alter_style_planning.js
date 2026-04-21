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
        await connection.query(`ALTER TABLE style_planning ADD COLUMN life_cycle JSON AFTER status`);
        console.log('Column "life_cycle" checked/added.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
