import db from "./db.js";

const sql = "ALTER TABLE garment_costing ADD COLUMN version VARCHAR(50) DEFAULT 'v1'";

db.query(sql, (err) => {
    if (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log("Column already exists");
        } else {
            console.error("Error:", err);
        }
    } else {
        console.log("Column added successfully");
    }
    process.exit();
});
