import db from './db.js';

const tables = [
    'fabric_to_pcs_outward',
    'fabric_to_pcs_inward',
    'fabric_to_pcs_return'
];

async function check() {
    for (const table of tables) {
        try {
            const [rows] = await db.promise().query(`DESCRIBE ${table}`);
            const hasShipTo = rows.some(r => r.Field === 'ship_to');
            console.log(`${table} has ship_to: ${hasShipTo}`);
        } catch (err) {
            console.error(`Error describing ${table}: ${err.message}`);
        }
    }
    db.end();
    process.exit(0);
}

check();
