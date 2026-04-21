import db from './db.js';

const tables = [
    'fabric_to_pcs_outward',
    'fabric_to_pcs_inward',
    'fabric_to_pcs_return'
];

async function runMigration() {
    for (const table of tables) {
        const query = `ALTER TABLE ${table} ADD COLUMN ship_to VARCHAR(255) AFTER party_name`;
        try {
            await db.promise().query(query);
            console.log(`Successfully added ship_to to ${table}`);
        } catch (err) {
            console.error(`Error adding ship_to to ${table}: ${err.message}`);
        }
    }
    db.end();
    process.exit(0);
}

runMigration();
