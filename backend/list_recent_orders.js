import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
});

const [rows] = await db.query('SELECT id, order_no, order_name, status FROM order_planning ORDER BY id DESC LIMIT 5');
console.log(JSON.stringify(rows, null, 2));
await db.end();
