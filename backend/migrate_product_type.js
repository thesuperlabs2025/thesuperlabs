import db from './db.js';

const sql = `ALTER TABLE products ADD COLUMN product_type VARCHAR(50) DEFAULT 'Product' AFTER product_name`;

db.query(sql, (err) => {
    if (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log("Column product_type already exists.");
        } else {
            console.error("Error adding column:", err);
        }
    } else {
        console.log("Column product_type added successfully.");
    }
    process.exit();
});
