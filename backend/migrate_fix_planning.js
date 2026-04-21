import mysql from 'mysql2';

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "14043011",
    database: "garments"
});

const run = async () => {
    try {
        console.log("Checking and adding missing columns...");

        // Check yarn_planning
        const [yarnCols] = await db.promise().query("SHOW COLUMNS FROM yarn_planning");
        const yarnColNames = yarnCols.map(c => c.Field);

        if (!yarnColNames.includes('fabric_id_ref')) {
            await db.promise().query("ALTER TABLE yarn_planning ADD COLUMN fabric_id_ref INT AFTER order_id");
            console.log("Added fabric_id_ref to yarn_planning");
        }
        if (!yarnColNames.includes('yarn_counts')) {
            await db.promise().query("ALTER TABLE yarn_planning ADD COLUMN yarn_counts VARCHAR(100) AFTER yarn_name");
            console.log("Added yarn_counts to yarn_planning");
        }
        if (!yarnColNames.includes('yarn_color')) {
            await db.promise().query("ALTER TABLE yarn_planning ADD COLUMN yarn_color VARCHAR(100) AFTER yarn_counts");
            console.log("Added yarn_color to yarn_planning");
        }
        if (!yarnColNames.includes('consumption')) {
            await db.promise().query("ALTER TABLE yarn_planning ADD COLUMN consumption DECIMAL(10,3) DEFAULT 0 AFTER yarn_color");
            console.log("Added consumption to yarn_planning");
        } else {
            // Update type if it exists but is wrong
            await db.promise().query("ALTER TABLE yarn_planning MODIFY COLUMN consumption DECIMAL(10,3) DEFAULT 0");
            console.log("Updated consumption type in yarn_planning");
        }

        // Check trims_planning
        const [trimCols] = await db.promise().query("SHOW COLUMNS FROM trims_planning");
        const trimColNames = trimCols.map(c => c.Field);

        if (!trimColNames.includes('style_part')) {
            await db.promise().query("ALTER TABLE trims_planning ADD COLUMN style_part VARCHAR(50) AFTER order_id");
            console.log("Added style_part to trims_planning");
        }

        console.log("Migration completed successfully!");
    } catch (err) {
        console.error('Migration Error:', err);
    }
    process.exit();
};

run();
