import mysql from 'mysql2/promise';

const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
};

async function fixDuplicates() {
    let connection;
    try {
        connection = await mysql.createConnection(connectionConfig);
        console.log('Connected to database.');

        // 1. Identify and delete duplicates (keeping the lowest ID)
        console.log('Identifying and removing duplicate Trims SKUs...');
        const deleteSql = `
            DELETE t1 FROM trims t1
            INNER JOIN trims t2 
            WHERE 
                t1.id > t2.id AND 
                t1.trims_sku = t2.trims_sku
        `;
        const [deleteResult] = await connection.query(deleteSql);
        console.log(`Removed ${deleteResult.affectedRows} duplicate rows.`);

        // 2. Add UNIQUE constraint to prevent future duplicates
        console.log('Adding UNIQUE constraint to trims_sku...');
        // First check if index already exists
        const [indexes] = await connection.query("SHOW INDEX FROM trims WHERE Column_name = 'trims_sku' AND Non_unique = 0");

        if (indexes.length === 0) {
            await connection.query('ALTER TABLE trims ADD UNIQUE (trims_sku)');
            console.log('UNIQUE constraint added successfully.');
        } else {
            console.log('UNIQUE constraint already exists.');
        }

    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        if (connection) await connection.end();
        console.log('Connection closed.');
    }
}

fixDuplicates();
