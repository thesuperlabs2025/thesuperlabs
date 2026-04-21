import mysql from 'mysql2';

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "14043011",
    database: "garments"
});

const run = async () => {
    try {
        console.log('Alter yarn_planning table...');

        const [columns] = await db.promise().query(`SHOW COLUMNS FROM yarn_planning`);
        const colNames = columns.map(c => c.Field);

        if (!colNames.includes('fabric_id_ref')) {
            await db.promise().query(`ALTER TABLE yarn_planning ADD COLUMN fabric_id_ref INT AFTER order_id`);
            console.log('Added fabric_id_ref');
        }

        if (!colNames.includes('yarn_counts')) {
            await db.promise().query(`ALTER TABLE yarn_planning ADD COLUMN yarn_counts VARCHAR(100) AFTER yarn_name`);
            console.log('Added yarn_counts');
        }

        if (!colNames.includes('yarn_color')) {
            await db.promise().query(`ALTER TABLE yarn_planning ADD COLUMN yarn_color VARCHAR(100) AFTER yarn_counts`);
            console.log('Added yarn_color');
        }

        if (!colNames.includes('consumption')) {
            await db.promise().query(`ALTER TABLE yarn_planning ADD COLUMN consumption DECIMAL(5,2) DEFAULT 0 AFTER yarn_color`);
            console.log('Added consumption');
        }

        console.log('yarn_planning table altered successfully');
    } catch (err) {
        console.error('Migration Error:', err);
    }
    process.exit();
};

run();
