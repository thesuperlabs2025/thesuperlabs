import db from "./db.js";

const createTableSql = `
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    user_name VARCHAR(255),
    action VARCHAR(50), 
    table_name VARCHAR(100),
    row_id INT,
    old_data JSON,
    new_data JSON,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

db.query(createTableSql, (err, result) => {
    if (err) {
        console.error("❌ Error creating activity_logs table:", err);
    } else {
        console.log("✅ activity_logs table ready");
    }
    process.exit();
});
