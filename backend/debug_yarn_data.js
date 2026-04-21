import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
});

const [rows] = await db.query('SELECT * FROM yarn_planning WHERE order_id = 7');
console.log(JSON.stringify(rows, null, 2));
await db.end();
