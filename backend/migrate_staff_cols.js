import db from "./db.js";

const cols = [
    { col: "staff_name", sql: "VARCHAR(255) NULL" },
    { col: "staff_remarks", sql: "TEXT NULL" },
];

let done = 0;
for (const { col, sql } of cols) {
    db.query(`ALTER TABLE yarn_dyeing_outward ADD COLUMN ${col} ${sql}`, (err) => {
        if (err && err.code !== "ER_DUP_FIELDNAME") {
            console.error(`❌ ${col}:`, err.message);
        } else {
            console.log(`✅ ${col} OK`);
        }
        if (++done === cols.length) process.exit(0);
    });
}
