import db from './db.js';
(async () => {
    try {
        const tables = ['sales_return', 'purchase_return', 'credit_note', 'debit_note'];
        for (const t of tables) {
            const [rows] = await db.promise().query(`DESCRIBE ??`, [t]);
            console.log(`${t}:`, rows.map(r => r.Field).includes('year_id') ? 'YES' : 'NO');
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
})();
