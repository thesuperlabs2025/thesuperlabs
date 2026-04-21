import db from './db.js';

const tablesToUpdate = [
    'quotation', 'pi', 'dc', 'po', 'grn', 'estimate',
    'sales_return', 'purchase_return', 'credit_note', 'debit_note'
];

(async () => {
    try {
        // 1. Get the current active year ID
        const [activeYearRows] = await db.promise().query('SELECT year_id FROM accounting_years WHERE is_active = 1 LIMIT 1');
        const activeYearId = activeYearRows.length > 0 ? activeYearRows[0].year_id : null;

        if (!activeYearId) {
            console.error('No active accounting year found. Migration aborted.');
            process.exit(1);
        }

        console.log(`Using Active Year ID: ${activeYearId}`);

        for (const table of tablesToUpdate) {
            console.log(`Checking table: ${table}`);
            const [columns] = await db.promise().query(`DESCRIBE ??`, [table]);
            
            if (!columns.some(c => c.Field === 'year_id')) {
                console.log(`Adding year_id to ${table}...`);
                await db.promise().query(`ALTER TABLE ?? ADD COLUMN year_id INT DEFAULT NULL`, [table]);
                
                console.log(`Backfilling year_id for ${table}...`);
                await db.promise().query(`UPDATE ?? SET year_id = ? WHERE year_id IS NULL`, [table, activeYearId]);
                
                console.log(`Successfully updated ${table}`);
            } else {
                console.log(`Table ${table} already has year_id.`);
            }
        }
        
        console.log('All migrations completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
})();
