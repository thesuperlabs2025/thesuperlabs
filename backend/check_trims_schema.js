import mysql from 'mysql2/promise';

const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
};

async function checkSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(connectionConfig);
        const [rows] = await connection.query('DESCRIBE trims');
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkSchema();
