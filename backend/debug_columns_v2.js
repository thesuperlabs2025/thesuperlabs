import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
});

async function describe(table) {
    const [rows] = await db.query(`DESCRIBE ${table}`);
    console.log(`${table}:`, rows.map(r => r.Field).join(', '));
}

await describe('fabric_planning_items');
await describe('yarn_planning');
await describe('trims_planning');

await db.end();
