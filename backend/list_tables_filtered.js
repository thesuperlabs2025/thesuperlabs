import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
});

const [rows] = await db.query('SHOW TABLES');
const tables = rows.map(r => Object.values(r)[0]);

const filters = ['stock', 'yarn', 'fabric', 'trim', 'style'];
const filtered = tables.filter(t => filters.some(f => t.toLowerCase().includes(f)));

console.log(JSON.stringify(filtered, null, 2));
await db.end();
