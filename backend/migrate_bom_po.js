import mysql from 'mysql2';

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "14043011",
    database: "garments"
});

const run = async () => {
    try {
        console.log("Adding export_to_po to order_bom...");

        const [cols] = await db.promise().query("SHOW COLUMNS FROM order_bom");
        const colNames = cols.map(c => c.Field);

        if (!colNames.includes('export_to_po')) {
            await db.promise().query("ALTER TABLE order_bom ADD COLUMN export_to_po TINYINT(1) DEFAULT 0 AFTER final_qty");
            console.log("Added export_to_po to order_bom");
        } else {
            console.log("export_to_po already exists");
        }

        console.log("Migration completed successfully!");
    } catch (err) {
        console.error('Migration Error:', err);
    }
    process.exit();
};

run();
