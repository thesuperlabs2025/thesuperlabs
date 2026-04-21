import db from "./db.js";

const tables = [
    'credit_note', 'debit_note', 'estimate', 'quotation',
    'invoices', 'receipts', 'purchases', 'order_planning', 'dc', 'po', 'grn', 'pi',
    'vouchers', 'sales_return', 'purchase_return'
];

async function checkColumns() {
    console.log("TABLE | HAS_YEAR_ID");
    console.log("-------------------");
    for (const table of tables) {
        try {
            const [rows] = await db.promise().query(`SHOW COLUMNS FROM ${table} LIKE 'year_id'`);
            console.log(`${table.padEnd(20)} | ${rows.length > 0 ? 'YES' : 'NO'}`);
        } catch (err) {
            console.log(`${table.padEnd(20)} | ERROR: ${err.message}`);
        }
    }
    process.exit();
}

checkColumns();
