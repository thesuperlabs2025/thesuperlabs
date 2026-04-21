import db from "./db.js";

const checkTable = async (table) => {
    try {
        const [columns] = await db.promise().query(`DESCRIBE ${table}`);
        console.log(`Columns in ${table}:`, columns.map(c => c.Field).join(", "));
    } catch (err) {
        console.error(`Error describing ${table}:`, err);
    }
};

const run = async () => {
    await checkTable("fabrics");
    await checkTable("yarn");
    await checkTable("trims");
    await checkTable("style_fabrics");
    await checkTable("style_yarns");
    await checkTable("style_trims");
    process.exit();
};

run();
