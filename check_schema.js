
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkSchema() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'garments_erp'
    });

    const tables = [
        'yarn_grn_items', 'fabric_grn_items', 'trims_grn_items', 'garments_grn_items',
        'yarn_po_items', 'fabric_po_items', 'trims_po_items', 'garments_po_items'
    ];

    for (const table of tables) {
        try {
            const [rows] = await db.execute(`DESC \`${table}\``);
            console.log(`\n--- ${table} ---`);
            console.table(rows.map(r => ({ Field: r.Field, Type: r.Type })));
        } catch (err) {
            console.error(`Error checking ${table}:`, err.message);
        }
    }
    await db.end();
}

checkSchema();
