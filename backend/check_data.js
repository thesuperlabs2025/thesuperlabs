import db from './db.js';
(async () => {
    try {
        const [rows] = await db.promise().query('SELECT count(*) as count, year_id FROM invoices GROUP BY year_id');
        console.log('Invoice Year Counts:', rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
})();
