import db from "./db.js";

async function migrate() {
    const tablesToUpdate = ['credit_note', 'debit_note', 'estimate', 'quotation'];
    
    for (const table of tablesToUpdate) {
        try {
            console.log(`Checking table: ${table}`);
            const [columns] = await db.promise().query(`SHOW COLUMNS FROM ${table} LIKE 'year_id'`);
            
            if (columns.length === 0) {
                console.log(`Adding year_id to ${table}...`);
                await db.promise().query(`ALTER TABLE ${table} ADD COLUMN year_id INT DEFAULT 1`);
                console.log(`Added year_id to ${table}.`);
            } else {
                console.log(`year_id already exists in ${table}.`);
            }
            
            let dateColumn = '';
            if (table === 'credit_note') dateColumn = 'credit_note_date';
            else if (table === 'debit_note') dateColumn = 'debit_note_date';
            else if (table === 'estimate') dateColumn = 'estimate_date';
            else if (table === 'quotation') dateColumn = 'quotation_date';
            
            if (dateColumn) {
                console.log(`Backfilling year_id for ${table} using ${dateColumn}...`);
                await db.promise().query(`UPDATE ${table} SET year_id = 2 WHERE ${dateColumn} >= '2025-04-01' AND ${dateColumn} <= '2026-03-31'`);
                await db.promise().query(`UPDATE ${table} SET year_id = 1 WHERE ${dateColumn} >= '2024-04-01' AND ${dateColumn} <= '2025-03-31'`);
                console.log(`Backfilled ${table}.`);
            }
            
        } catch (err) {
            console.error(`Error processing ${table}:`, err.message);
        }
    }
    
    const otherTables = [
        { name: 'invoices', date: 'invoice_date' },
        { name: 'receipts', date: 'TransactionDate' },
        { name: 'purchases', date: 'purchase_date' },
        { name: 'order_planning', date: 'order_date' },
        { name: 'dc', date: 'dc_date' },
        { name: 'po', date: 'po_date' },
        { name: 'grn', date: 'grn_date' },
        { name: 'pi', date: 'pi_date' }
    ];
    
    for (const table of otherTables) {
        try {
            console.log(`Backfilling other table: ${table.name}`);
            await db.promise().query(`UPDATE ${table.name} SET year_id = 2 WHERE ${table.date} >= '2025-04-01' AND ${table.date} <= '2026-03-31'`);
            await db.promise().query(`UPDATE ${table.name} SET year_id = 1 WHERE ${table.date} >= '2024-04-01' AND ${table.date} <= '2025-03-31'`);
            console.log(`Backfilled ${table.name}.`);
        } catch (err) {
            console.error(`Error backfilling ${table.name}:`, err.message);
        }
    }

    process.exit();
}

migrate();
