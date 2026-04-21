import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

async function migrate() {
    try {
        console.log("Starting migration for Fabric and Trims inward...");

        try {
            await db.query("ALTER TABLE fabric_direct_inward ADD COLUMN order_no VARCHAR(255) AFTER inward_no");
            console.log("Added order_no to fabric_direct_inward");
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME' || e.code === 'ER_DUP_FIELDNAME') console.log("order_no already exists in fabric_direct_inward");
            else throw e;
        }

        try {
            await db.query("ALTER TABLE trims_direct_inward ADD COLUMN order_no VARCHAR(255) AFTER inward_no");
            console.log("Added order_no to trims_direct_inward");
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME' || e.code === 'ER_DUP_FIELDNAME') console.log("order_no already exists in trims_direct_inward");
            else throw e;
        }

        try {
            await db.query("ALTER TABLE direct_inward ADD COLUMN order_no VARCHAR(255) AFTER inward_no");
            console.log("Added order_no to direct_inward");
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME' || e.code === 'ER_DUP_FIELDNAME') console.log("order_no already exists in direct_inward");
            else throw e;
        }

        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
