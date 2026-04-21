import db from './db.js';
(async () => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM accounting_years');
        console.log('Accounting Years:', rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
})();
