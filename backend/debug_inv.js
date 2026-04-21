const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '14043011',
    database: process.env.DB_NAME || 'erp'
});

connection.connect();

connection.query('SELECT * FROM invoices WHERE id = 153', (error, results) => {
    if (error) console.error(error);
    else console.log('Invoice 153:', results[0]);
    connection.end();
});
