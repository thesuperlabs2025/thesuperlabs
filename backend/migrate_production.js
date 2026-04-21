import db from "./db.js";

const productionTables = [
    { name: 'tna_headers', date: 'created_at' }, // Adjust if there's a better date column
    { name: 'pcs_inward', date: 'inward_date' },
    { name: 'pcs_outward', date: 'outward_date' },
    { name: 'fabric_to_pcs_inward', date: 'inward_date' },
    { name: 'fabric_to_pcs_outward', date: 'outward_date' },
    { name: 'yarn_dyeing_inward', date: 'inward_date' },
    { name: 'yarn_dyeing_outward', date: 'outward_date' },
    { name: 'pcs_return', date: 'return_date' },
    { name: 'fabric_to_pcs_return', date: 'return_date' },
    { name: 'yarn_dyeing_return', date: 'return_date' }
];

async function migrateProduction() {
    for (const table of productionTables) {
        try {
            console.log(`Backfilling production table: ${table.name}`);
            await db.promise().query(`UPDATE ${table.name} SET year_id = 2 WHERE ${table.date} >= '2025-04-01' AND ${table.date} <= '2026-03-31'`);
            await db.promise().query(`UPDATE ${table.name} SET year_id = 1 WHERE ${table.date} >= '2024-04-01' AND ${table.date} <= '2025-03-31'`);
            console.log(`Backfilled ${table.name}.`);
        } catch (err) {
            console.error(`Error backfilling ${table.name}:`, err.message);
        }
    }
    process.exit();
}

migrateProduction();
