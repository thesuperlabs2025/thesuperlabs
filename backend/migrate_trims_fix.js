import mysql from 'mysql2/promise';

const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
};

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection(connectionConfig);
        console.log('Connected to database.');

        // Add uom column
        try {
            await connection.query('ALTER TABLE trims ADD COLUMN uom VARCHAR(50) AFTER color');
            console.log('Column "uom" added.');
        } catch (e) {
            console.log('Column "uom" might already exist.');
        }

        // Add trims_sku column
        try {
            await connection.query('ALTER TABLE trims ADD COLUMN trims_sku VARCHAR(255) AFTER trims_name');
            console.log('Column "trims_sku" added.');
        } catch (e) {
            console.log('Column "trims_sku" might already exist.');
        }

        console.log('Migration completed.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
