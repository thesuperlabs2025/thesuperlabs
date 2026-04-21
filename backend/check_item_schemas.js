import db from "./db.js";

const tables = ["yarn_grn_items", "fabric_grn_items", "trims_grn_items", "garments_grn_items", "general_grn_items"];

async function check() {
    for (const table of tables) {
        console.log(`Schema for ${table}:`);
        db.query(`DESC ${table}`, (err, res) => {
            if (err) console.error(err);
            console.table(res);
        });
    }
}

check();
