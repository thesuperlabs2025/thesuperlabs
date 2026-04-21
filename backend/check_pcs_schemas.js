import db from './db.js';
const tables = ['pcs_outward', 'pcs_inward', 'pcs_return'];
for (const table of tables) {
    const [rows] = await db.promise().query(`DESCRIBE ${table}`);
    console.log(`--- ${table} ---`);
    console.log(JSON.stringify(rows, null, 2));
}
process.exit();
