import db from "./db.js";

const sql = [
    "ALTER TABLE yarn_dyeing_outward_items ADD COLUMN fabric_name VARCHAR(255) AFTER color",
    "ALTER TABLE yarn_dyeing_inward_items ADD COLUMN fabric_name VARCHAR(255) AFTER color"
];

const run = async () => {
    for (const q of sql) {
        try {
            await new Promise((resolve, reject) => {
                db.query(q, (err) => {
                    if (err) {
                        if (err.code === 'ER_DUP_COLUMN_NAME') {
                            console.log(`Column already exists in ${q.split(' ')[2]}`);
                            resolve();
                        } else {
                            reject(err);
                        }
                    } else resolve();
                });
            });
            console.log(`Success: ${q}`);
        } catch (e) {
            console.error(`Error: ${e.message}`);
        }
    }
    process.exit();
};

run();
