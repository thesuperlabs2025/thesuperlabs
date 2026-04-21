import db from './db.js';
(async () => {
    try {
        const [tables] = await db.promise().query('SHOW TABLES');
        const withYear = [];
        const withoutYear = [];
        for (let row of tables) {
            const tableName = Object.values(row)[0];
            const [columns] = await db.promise().query(`DESCRIBE ??`, [tableName]);
            if (columns.some(c => c.Field === 'year_id')) withYear.push(tableName);
            else withoutYear.push(tableName);
        }
        console.log('WITH year_id:', withYear);
        console.log('WITHOUT year_id:', withoutYear);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
})();
