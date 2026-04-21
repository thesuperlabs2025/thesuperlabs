import db from "./db.js";

async function migrate() {
    try {
        console.log("Adding wastage_pct to yarn_planning...");
        const [cols] = await db.promise().query("SHOW COLUMNS FROM yarn_planning");
        const colNames = cols.map(c => c.Field);

        if (!colNames.includes("wastage_pct")) {
            await db.promise().query("ALTER TABLE yarn_planning ADD COLUMN wastage_pct DECIMAL(5,2) DEFAULT 0 AFTER consumption");
            console.log("Added wastage_pct to yarn_planning");
        } else {
            console.log("wastage_pct already exists");
        }

        console.log("Migration complete!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
