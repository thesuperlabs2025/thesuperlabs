import db from "./db.js";

const tables = ["yarn_grn", "fabric_grn", "trims_grn", "garments_grn", "general_grn"];
const itemTables = ["yarn_grn_items", "fabric_grn_items", "trims_grn_items", "garments_grn_items", "general_grn_items"];

async function check() {
    for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const itemTable = itemTables[i];
        console.log(`Checking ${table} and ${itemTable}...`);

        db.query(`SELECT id, grn_no FROM ${table} LIMIT 5`, (err, grns) => {
            if (err) {
                console.error(err);
                return;
            }
            grns.forEach(grn => {
                db.query(`SELECT SUM(qty) as total FROM ${itemTable} WHERE grn_id = ?`, [grn.id], (err, items) => {
                    if (err) console.error(err);
                    console.log(`GRN ${grn.grn_no} (ID: ${grn.id}): Total Qty = ${items[0].total}`);
                });
            });
        });
    }
}

check();
