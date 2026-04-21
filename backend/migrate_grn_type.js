import db from './db.js';

const migrate = async () => {
    try {
        await db.promise().query("ALTER TABLE job_grn CHANGE typ type ENUM('Normal','Sample') DEFAULT 'Normal'");
        console.log("✅ job_grn column 'typ' renamed to 'type'");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        process.exit(1);
    }
};

migrate();
