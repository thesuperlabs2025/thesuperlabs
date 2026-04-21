import db from './db.js';
(async () => {
    try {
        const [rows] = await db.promise().query('DESCRIBE order_planning');
        console.log('Columns in order_planning:', rows.map(r => r.Field));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
})();
