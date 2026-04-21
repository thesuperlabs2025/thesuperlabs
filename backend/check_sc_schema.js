import mysql from 'mysql2/promise';

const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
};

async function check() {
    let connection;
    try {
        connection = await mysql.createConnection(connectionConfig);
        const [rows] = await connection.query('DESCRIBE size_charts');
        console.log(JSON.stringify(rows));
    } catch (e) {
        console.error(e.message);
    } finally {
        if (connection) await connection.end();
    }
}

check();
