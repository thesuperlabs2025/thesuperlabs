import db from "./db.js";

const tables = [
    'invoices', 'receipts', 'purchases', 'order_planning', 'dc', 'po', 'grn', 'pi'
];

async function checkColumns() {
    const results = {};
    for (const table of tables) {
        try {
            const [rows] = await db.promise().query(`SHOW COLUMNS FROM ${table}`);
            results[table] = rows.map(r => r.Field);
        } catch (err) {
            results[table] = err.message;
        }
    }
    console.log(JSON.stringify(results, null, 2));
    process.exit();
}

checkColumns();
