import db from './db.js';

const sql = "ALTER TABLE yarn_direct_inward ADD COLUMN order_no VARCHAR(255) AFTER inward_no";

db.query(sql, (err) => {
    if (err) {
        if (err.code === 'ER_DUP_COLUMN') {
            console.log("Column already exists");
        } else {
            console.error("Migration error:", err);
        }
    } else {
        console.log("Column added successfully");
    }
    process.exit();
});
