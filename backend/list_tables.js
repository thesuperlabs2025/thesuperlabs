import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
});

const [rows] = await db.query('SHOW TABLES');
console.log(rows.map(r => Object.values(r)[0]));
await db.end();
