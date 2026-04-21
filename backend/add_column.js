import db from './db.js';

db.query("ALTER TABLE life_cycles ADD COLUMN sort_order INT DEFAULT 0", (err) => {
    if (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log("Column sort_order already exists.");
        } else {
            console.error("Error adding column:", err);
        }
    } else {
        console.log("Column sort_order added successfully.");
    }
    process.exit();
});
