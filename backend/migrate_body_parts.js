import mysql from 'mysql2/promise';

async function migrate() {
    const conn = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "14043011",
        database: "garments"
    });

    console.log('Connected to MySQL');

    // Create body_parts table
    await conn.query(`
        CREATE TABLE IF NOT EXISTS body_parts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            part_name VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('Table body_parts created');

    // Insert some default body parts if empty
    const [rows] = await conn.query('SELECT COUNT(*) as count FROM body_parts');
    if (rows[0].count === 0) {
        const parts = [['Front'], ['Back'], ['Sleeve'], ['Neck'], ['Pocket'], ['Collar']];
        await conn.query('INSERT INTO body_parts (part_name) VALUES ?', [parts]);
        console.log('Default body parts inserted');
    }

    console.log('Migration completed successfully');
    await conn.end();
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
