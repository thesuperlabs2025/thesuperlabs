import db from "./db.js";

const tables = [
    'vouchers', 'sales_return', 'purchase_return'
];

async function checkMoreCounts() {
    const results = {};
    for (const table of tables) {
        try {
            const [rows1] = await db.promise().query(`SELECT COUNT(*) as count FROM ${table} WHERE year_id = 1`);
            const [rows2] = await db.promise().query(`SELECT COUNT(*) as count FROM ${table} WHERE year_id = 2`);
            results[table] = { year1: rows1[0].count, year2: rows2[0].count };
        } catch (err) {
            results[table] = err.message;
        }
    }
    console.log(JSON.stringify(results, null, 2));
    process.exit();
}

checkMoreCounts();
