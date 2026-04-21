import db from "./db.js";

const updateLeadsTable = async () => {
    const query = `ALTER TABLE leads MODIFY COLUMN lead_status VARCHAR(100) DEFAULT 'New'`;
    try {
        await db.promise().query(query);
        console.log("✅ Table 'leads' updated: lead_status is now VARCHAR.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating 'leads' table:", err);
        process.exit(1);
    }
};

updateLeadsTable();
