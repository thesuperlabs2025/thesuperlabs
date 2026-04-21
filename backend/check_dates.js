import db from './db.js';
async function run() {
    const tables = ['pcs_outward', 'pcs_inward', 'pcs_return'];
    for (const table of tables) {
        const [rows] = await db.promise().query(`DESCRIBE ${table}`);
        const dateDesc = rows.filter(r => r.Field.toLowerCase().includes('date'));
        console.log(table, dateDesc);
    }
    process.exit();
}
run();
