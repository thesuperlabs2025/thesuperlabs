
import db from "./db.js";

console.log("Checking data in yarn_dyeing_outward_items...");

const sql = "SELECT id, fabric_name FROM yarn_dyeing_outward_items ORDER BY id DESC LIMIT 10";

db.query(sql, (err, rows) => {
    if (err) {
        console.error("Error fetching data:", err);
    } else {
        console.log("Last 10 items:");
        console.table(rows);
    }
    db.end();
});
