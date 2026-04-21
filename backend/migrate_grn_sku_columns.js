import mysql from 'mysql2/promise';

const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
};

const tablesToCheck = [
    { table: 'yarn_grn_items', columns: ['yarn_sku'] },
    { table: 'fabric_po_items', columns: ['fabric_sku'] },
    { table: 'fabric_grn_items', columns: ['fabric_sku'] },
    { table: 'trims_po_items', columns: ['trims_sku'] },
    { table: 'trims_grn_items', columns: ['trims_sku'] }
];

async function migrateColumns() {
    let connection;
    try {
        connection = await mysql.createConnection(connectionConfig);
        console.log('Connected to database.');

        for (const item of tablesToCheck) {
            console.log(`Checking table: ${item.table}`);
            const [columns] = await connection.query(`DESCRIBE ${item.table}`);

            for (const colName of item.columns) {
                const hasCol = columns.some(col => col.Field === colName);
                if (!hasCol) {
                    console.log(`Adding column ${colName} to ${item.table}`);
                    await connection.query(`ALTER TABLE ${item.table} ADD COLUMN ${colName} VARCHAR(255)`);
                } else {
                    console.log(`Column ${colName} already exists in ${item.table}`);
                }
            }
        }

    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        if (connection) await connection.end();
        console.log('Connection closed.');
    }
}

migrateColumns();
