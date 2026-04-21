import db from "./db.js";

const addColumn = async () => {
    try {
        await db.promise().query("ALTER TABLE invoices ADD COLUMN job_inward_id INT NULL DEFAULT NULL");
        console.log("Successfully added job_inward_id to invoices");
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log("Column already exists");
        } else {
            console.error("Error:", err.message);
        }
    }
    process.exit();
};

addColumn();
