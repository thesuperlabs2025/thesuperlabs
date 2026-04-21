import db from "./db.js";

const addColumnIfNotExists = async (table, column, definition) => {
    const [columns] = await db.promise().query(`SHOW COLUMNS FROM ${table} LIKE '${column}'`);
    if (columns.length === 0) {
        await db.promise().query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
        console.log(`Added ${column} to ${table}`);
    } else {
        console.log(`${column} already exists in ${table}`);
    }
};

const migrate = async () => {
    try {
        await addColumnIfNotExists("style_trims", "trims_sku", "VARCHAR(255) AFTER trims_name");
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        process.exit();
    }
};

migrate();
