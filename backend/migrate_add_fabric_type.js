import mysql from 'mysql2';

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "14043011",
    database: "garments"
});

const run = async () => {
    try {
        console.log("Checking columns for fabric_planning_items...");

        const [cols] = await db.promise().query("SHOW COLUMNS FROM fabric_planning_items");
        const colNames = cols.map(c => c.Field);

        if (!colNames.includes('fabric_type')) {
            await db.promise().query("ALTER TABLE fabric_planning_items ADD COLUMN fabric_type ENUM('Yarn', 'Ready Fabric') DEFAULT 'Yarn' AFTER composition");
            console.log("Added fabric_type to fabric_planning_items");
        } else {
            console.log("fabric_type already exists");
        }

        console.log("Migration completed successfully!");
    } catch (err) {
        console.error('Migration Error:', err);
    }
    process.exit();
};

run();
