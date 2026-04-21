import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
});

const [rows] = await db.query('SELECT * FROM style_yarns WHERE style_id = 16');
console.log(JSON.stringify(rows, null, 2));
await db.end();
