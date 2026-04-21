
import db from "./db.js";

console.log("Starting schema fix for yarn dyeing...");

function checkAndFix() {
    const tables = ["yarn_dyeing_outward_items", "yarn_dyeing_inward_items"];
    let pending = tables.length;

    // Check if tables exist first to avoid crashing on missing table
    tables.forEach(table => {
        const checkTableSql = `SHOW TABLES LIKE '${table}'`;
        db.query(checkTableSql, (err, results) => {
            if (err) {
                console.error(`Error checking if table ${table} exists:`, err.message);
                finish(tables.length);
                return;
            }
            if (results.length === 0) {
                console.log(`Table ${table} does not exist. Skipping.`);
                pending--;
                if (pending === 0) finish();
                return;
            }

            // Table exists, check column
            const sql = `SHOW COLUMNS FROM ${table} LIKE 'fabric_name'`;
            db.query(sql, (err, colResults) => {
                if (err) {
                    console.error(`Error checking columns for ${table}:`, err.message);
                    pending--;
                    if (pending === 0) finish();
                    return;
                }

                if (colResults.length === 0) {
                    console.log(`Adding fabric_name to ${table}...`);
                    db.query(`ALTER TABLE ${table} ADD COLUMN fabric_name VARCHAR(255) AFTER color`, (err2) => {
                        if (err2) console.error(`Failed to add column to ${table}:`, err2.message);
                        else console.log(`Successfully added fabric_name to ${table}`);

                        pending--;
                        if (pending === 0) finish();
                    });
                } else {
                    console.log(`Column fabric_name already exists in ${table}`);
                    pending--;
                    if (pending === 0) finish();
                }
            });
        });
    });
}

function finish() {
    console.log("Schema fix check completed.");
    db.end((err) => {
        if (err) console.error("Error closing DB pool:", err);
        process.exit(0);
    });
}

checkAndFix();
