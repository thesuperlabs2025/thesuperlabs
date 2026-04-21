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

await describe('style_fabrics');
await describe('style_yarns');
await describe('style_trims');
await describe('fabrics');
await describe('yarn');
await describe('trims');

await db.end();
