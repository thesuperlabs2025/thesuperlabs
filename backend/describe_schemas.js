import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
});

const tables = ['style_fabrics', 'style_yarns', 'style_trims', 'fabrics', 'yarn', 'trims'];

for (const table of tables) {
    console.log(`--- ${table} ---`);
    const [columns] = await db.query(`DESCRIBE ${table}`);
    console.log(columns.map(c => `${c.Field} (${c.Type})`).join(', '));
}

await db.end();
