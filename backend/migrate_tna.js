import mysql from 'mysql2/promise';

(async () => {
    const local = await mysql.createPool({ host: 'localhost', user: 'root', password: '14043011', database: 'garments' });
    const rds = await mysql.createPool({ host: 'garmentserp.cgl0o2cmehpp.us-east-1.rds.amazonaws.com', user: 'admin', password: '14043011', database: 'garmentserp' });

    try {
        const [r1] = await local.query('SHOW CREATE TABLE tna_process_master');
        const createSql = r1[0]['Create Table'];

        console.log('Creating table on RDS...');
        try {
            await rds.query(createSql);
        } catch (e) {
            console.error('Table might exist already:', e.message);
        }

        const [rows] = await local.query('SELECT * FROM tna_process_master');
        if (rows.length === 0) {
            console.log('No data to migrate.');
            process.exit(0);
        }

        const keys = Object.keys(rows[0]);
        const values = rows.map(r => keys.map(k => r[k]));

        console.log(`Inserting ${rows.length} rows into RDS...`);
        // We can use a loop or insert multiple but mysql2/promise `query` allows passing multiple using ? and mapping correctly if formatted
        // but simple loop is safer and fine for small tables

        for (const row of rows) {
            const columns = Object.keys(row);
            const vals = Object.values(row);
            await rds.query(`INSERT IGNORE INTO tna_process_master (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`, vals);
        }

        console.log('Done migrating schema and data.');
        process.exit(0);
    } catch (e) {
        console.error('Error during migration:', e);
        process.exit(1);
    }
})();
