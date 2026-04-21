import mysql from 'mysql2';

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "14043011",
    database: "garments"
});

const run = async () => {
    try {
        console.log("Adding total_req to fabric_planning_items...");

        const [cols] = await db.promise().query("SHOW COLUMNS FROM fabric_planning_items");
        const colNames = cols.map(c => c.Field);

        if (!colNames.includes('total_req')) {
            await db.promise().query("ALTER TABLE fabric_planning_items ADD COLUMN total_req DECIMAL(12,3) DEFAULT 0 AFTER avg_wt");
            console.log("Added total_req to fabric_planning_items");
        } else {
            console.log("total_req already exists");
        }

        console.log("Migration completed successfully!");
    } catch (err) {
        console.error('Migration Error:', err);
    }
    process.exit();
};

run();
