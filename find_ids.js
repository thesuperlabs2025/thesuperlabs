const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Usually empty on localhost unless specifically set
    database: 'garment_erp' // I remember seeing garment_erp earlier.
});

connection.query('SELECT order_no FROM order_planning LIMIT 1', (err, orders) => {
    if (err) {
        // If fail, try the other DB name
        const conn2 = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'garments' });
        conn2.query('SELECT order_no FROM order_planning LIMIT 1', (err2, orders2) => {
            if (err2) {
                // try the password from db.js
                const conn3 = mysql.createConnection({ host: 'localhost', user: 'root', password: 'password', database: 'garment_erp' });
                // ... okay I'll just check what the user has.
                console.error('Cant connect', err2);
            } else {
                console.log('Order No:', orders2[0]?.order_no);
            }
            conn2.end();
        });
    } else {
        console.log('Order No:', orders[0]?.order_no);
    }
    connection.end();
});
