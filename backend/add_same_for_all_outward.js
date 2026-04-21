import db from "./db.js";

const sql = "ALTER TABLE job_outward ADD COLUMN same_for_all BOOLEAN DEFAULT FALSE";

db.query(sql, (err) => {
    if (err) {
        console.error("Error adding column:", err.message);
    } else {
        console.log("Column 'same_for_all' added to job_outward successfully");
    }
    process.exit();
});
