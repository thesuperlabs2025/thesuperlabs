
import mysql from 'mysql2';

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
});

const queries = [
    "ALTER TABLE yarn_po_items ADD COLUMN yarn_sku VARCHAR(255) AFTER yarn_name",
    "ALTER TABLE fabric_po_items ADD COLUMN fabric_sku VARCHAR(255) AFTER fabric_name",
    "ALTER TABLE trims_po_items ADD COLUMN trims_sku VARCHAR(255) AFTER trims_name",
    "ALTER TABLE garments_po_items ADD COLUMN sku VARCHAR(255) AFTER style_name",
    "ALTER TABLE yarn_grn_items ADD COLUMN yarn_sku VARCHAR(255) AFTER yarn_name",
    "ALTER TABLE fabric_grn_items ADD COLUMN fabric_sku VARCHAR(255) AFTER fabric_name",
    "ALTER TABLE trims_grn_items ADD COLUMN trims_sku VARCHAR(255) AFTER trims_name",
    "ALTER TABLE garments_grn_items ADD COLUMN sku VARCHAR(255) AFTER garments_name"
];

for (let q of queries) {
    db.query(q, (err) => {
        if (err) {
            console.log(`Query failed: ${q} - ${err.message}`);
        } else {
            console.log(`Query success: ${q}`);
        }
    });
}

setTimeout(() => {
    db.end();
    process.exit(0);
}, 2000);
