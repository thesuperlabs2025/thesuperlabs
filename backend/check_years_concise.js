import db from './db.js';
(async () => {
    try {
        const [rows] = await db.promise().query('SELECT year_id, year_name, is_active FROM accounting_years');
        console.log(rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
})();
