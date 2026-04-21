import db from "./db.js";

const tables = ["yarn_po", "fabric_po", "trims_po", "garments_po", "general_po"];
const itemTables = ["yarn_po_items", "fabric_po_items", "trims_po_items", "garments_po_items", "general_po_items"];

async function run() {
    for (const table of tables) {
        console.log(`--- Schema for ${table} ---`);
        await new Promise((resolve) => {
            db.query(`DESCRIBE ${table}`, (err, data) => {
                if (err) console.error(err);
                else console.table(data.map(row => ({ Field: row.Field, Type: row.Type })));
                resolve();
            });
        });
    }

    for (const table of itemTables) {
        console.log(`--- Schema for ${table} ---`);
        await new Promise((resolve) => {
            db.query(`DESCRIBE ${table}`, (err, data) => {
                if (err) console.error(err);
                else console.table(data.map(row => ({ Field: row.Field, Type: row.Type })));
                resolve();
            });
        });
    }
    process.exit();
}

run();
