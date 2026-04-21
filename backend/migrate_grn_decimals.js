import db from "./db.js";

const tables = ["yarn_grn_items", "fabric_grn_items", "trims_grn_items", "garments_grn_items", "general_grn_items"];

async function migrate() {
    for (const table of tables) {
        console.log(`Migrating ${table}...`);
        try {
            // Get columns first
            const [columns] = await db.promise().query(`DESC ${table}`);
            const fieldNames = columns.map(c => c.Field);

            const mods = [];
            if (fieldNames.includes('qty')) mods.push(`MODIFY COLUMN qty DECIMAL(12,3)`);
            if (fieldNames.includes('per_bag')) mods.push(`MODIFY COLUMN per_bag DECIMAL(12,3)`);
            if (fieldNames.includes('per_bag_qty')) mods.push(`MODIFY COLUMN per_bag_qty DECIMAL(12,3)`);

            if (mods.length > 0) {
                await db.promise().query(`ALTER TABLE ${table} ${mods.join(', ')}`);
                console.log(`Finished ${table}`);
            } else {
                console.log(`No decimal columns to modify in ${table}`);
            }
        } catch (err) {
            console.error(`Error migrating ${table}:`, err);
        }
    }
    process.exit();
}

migrate();
