import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const db = mysql.createConnection({
    host: process.env.HOST || "localhost",
    user: process.env.USER || "root",
    password: process.env.PASSWORD || "14043011",
    database: process.env.DATABASE || "garments"
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to database for Altering Tables");

    const queries = [
        "ALTER TABLE yarn_direct_inward_items ADD COLUMN sku VARCHAR(100) AFTER inward_id",
        "ALTER TABLE fabric_direct_inward_items ADD COLUMN sku VARCHAR(100) AFTER inward_id",
        "ALTER TABLE trims_direct_inward_items ADD COLUMN sku VARCHAR(100) AFTER inward_id",
        "ALTER TABLE pcs_direct_inward_items ADD COLUMN sku VARCHAR(100) AFTER inward_id",
        "ALTER TABLE direct_inward_items ADD COLUMN sku VARCHAR(100) AFTER inward_id"
    ];

    let completed = 0;
    const runQuery = (index) => {
        if (index >= queries.length) {
            console.log("All tables altered.");
            db.end();
            process.exit(0);
        }
        db.query(queries[index], (err) => {
            if (err) {
                console.error("Error executing query (might already exist):", queries[index], err.message);
                // Continue even if error (e.g. column exists)
            } else {
                console.log(`Query ${index + 1} executed.`);
            }
            runQuery(index + 1);
        });
    };

    runQuery(0);
});
