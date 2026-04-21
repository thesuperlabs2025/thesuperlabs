
import mysql from 'mysql2/promise';

const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
};

const tables = [
    'yarn_grn', 'fabric_grn', 'trims_grn', 'garments_grn', 'general_grn',
    'yarn_grn_items' // also check items if needed, but header is enough for linking
];

async function addPoNoToGrn() {
    let connection;
    try {
        connection = await mysql.createConnection(connectionConfig);
        console.log('Connected to database.');

        const grnHeaders = ['yarn_grn', 'fabric_grn', 'trims_grn', 'garments_grn', 'general_grn'];

        for (const table of grnHeaders) {
            console.log(`Checking table: ${table}`);
            const [columns] = await connection.query(`DESCRIBE ${table}`);
            const hasPoNo = columns.some(col => col.Field === 'po_no');
            if (!hasPoNo) {
                console.log(`Adding po_no to ${table}`);
                await connection.query(`ALTER TABLE ${table} ADD COLUMN po_no VARCHAR(100)`);
            } else {
                console.log(`po_no already exists in ${table}`);
            }
        }

    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        if (connection) await connection.end();
        console.log('Connection closed.');
    }
}

addPoNoToGrn();
