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

        // 1. Style Planning Main Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS style_planning (
                id INT AUTO_INCREMENT PRIMARY KEY,
                style_name VARCHAR(255) NOT NULL,
                style_color VARCHAR(100),
                size_chart_id INT,
                size_chart_name VARCHAR(255),
                status VARCHAR(50) DEFAULT 'Planned',
                life_cycle JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Table "style_planning" checked/created.');

        // 2. Style Fabrics Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS style_fabrics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                style_id INT NOT NULL,
                style_part VARCHAR(255),
                fabric_name VARCHAR(255),
                body_part VARCHAR(255),
                size_data JSON,
                gsm VARCHAR(50),
                dia VARCHAR(50),
                color VARCHAR(100),
                composition VARCHAR(255),
                fabric_type VARCHAR(100),
                FOREIGN KEY (style_id) REFERENCES style_planning(id) ON DELETE CASCADE
            )
        `);
        console.log('Table "style_fabrics" checked/created.');

        // 3. Style Yarns Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS style_yarns (
                id INT AUTO_INCREMENT PRIMARY KEY,
                style_id INT NOT NULL,
                fabric_id_ref VARCHAR(255), -- React internal id reference for initial sync
                fabric_name VARCHAR(255),
                yarn_counts VARCHAR(100),
                yarn_name VARCHAR(255),
                yarn_color VARCHAR(100),
                consumption VARCHAR(100),
                FOREIGN KEY (style_id) REFERENCES style_planning(id) ON DELETE CASCADE
            )
        `);
        console.log('Table "style_yarns" checked/created.');

        // 4. Style Trims Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS style_trims (
                id INT AUTO_INCREMENT PRIMARY KEY,
                style_id INT NOT NULL,
                trims_name VARCHAR(255),
                is_sizable VARCHAR(50),
                size_data JSON,
                color VARCHAR(100),
                FOREIGN KEY (style_id) REFERENCES style_planning(id) ON DELETE CASCADE
            )
        `);
        console.log('Table "style_trims" checked/created.');

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
