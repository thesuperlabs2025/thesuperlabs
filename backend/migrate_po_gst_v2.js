import db from "./db.js";

const columnsToAdd = [
    { table: "general_po", column: "is_order_specific", type: "TINYINT(1) DEFAULT 0" },
    { table: "general_po", column: "is_lot_specific", type: "TINYINT(1) DEFAULT 0" },
    { table: "general_po", column: "order_id", type: "INT DEFAULT NULL" },
    { table: "general_po", column: "order_no", type: "VARCHAR(100) DEFAULT NULL" },
    { table: "general_po", column: "order_name", type: "VARCHAR(255) DEFAULT NULL" },
    { table: "general_po", column: "lot_no", type: "VARCHAR(100) DEFAULT NULL" },
    { table: "general_po", column: "lot_name", type: "VARCHAR(255) DEFAULT NULL" },
    { table: "general_po", column: "is_igst", type: "TINYINT(1) DEFAULT 0" },
    { table: "general_po", column: "round_off", type: "DECIMAL(10,2) DEFAULT 0.00" },

    { table: "garments_po", column: "is_order_specific", type: "TINYINT(1) DEFAULT 1" },
    { table: "garments_po", column: "is_lot_specific", type: "TINYINT(1) DEFAULT 0" },
    { table: "garments_po", column: "lot_no", type: "VARCHAR(100) DEFAULT NULL" },
    { table: "garments_po", column: "lot_name", type: "VARCHAR(255) DEFAULT NULL" },
    { table: "garments_po", column: "is_igst", type: "TINYINT(1) DEFAULT 0" },
    { table: "garments_po", column: "round_off", type: "DECIMAL(10,2) DEFAULT 0.00" },

    { table: "yarn_po", column: "is_igst", type: "TINYINT(1) DEFAULT 0" },
    { table: "yarn_po", column: "round_off", type: "DECIMAL(10,2) DEFAULT 0.00" },
    { table: "fabric_po", column: "is_igst", type: "TINYINT(1) DEFAULT 0" },
    { table: "fabric_po", column: "round_off", type: "DECIMAL(10,2) DEFAULT 0.00" },
    { table: "trims_po", column: "is_igst", type: "TINYINT(1) DEFAULT 0" },
    { table: "trims_po", column: "round_off", type: "DECIMAL(10,2) DEFAULT 0.00" },

    { table: "yarn_po_items", column: "gst_per", type: "DECIMAL(10,2) DEFAULT 0.00" },
    { table: "yarn_po_items", column: "total", type: "DECIMAL(15,2) DEFAULT 0.00" },
    { table: "fabric_po_items", column: "gst_per", type: "DECIMAL(10,2) DEFAULT 0.00" },
    { table: "fabric_po_items", column: "total", type: "DECIMAL(15,2) DEFAULT 0.00" },
    { table: "trims_po_items", column: "gst_per", type: "DECIMAL(10,2) DEFAULT 0.00" },
    { table: "trims_po_items", column: "total", type: "DECIMAL(15,2) DEFAULT 0.00" },

    { table: "garments_po_items", column: "rate", type: "DECIMAL(10,2) DEFAULT 0.00" },
    { table: "garments_po_items", column: "gst_per", type: "DECIMAL(10,2) DEFAULT 0.00" },
    { table: "garments_po_items", column: "total", type: "DECIMAL(15,2) DEFAULT 0.00" },

    { table: "general_po_items", column: "rate", type: "DECIMAL(10,2) DEFAULT 0.00" },
    { table: "general_po_items", column: "gst_per", type: "DECIMAL(10,2) DEFAULT 0.00" },
    { table: "general_po_items", column: "total", type: "DECIMAL(15,2) DEFAULT 0.00" }
];

async function run() {
    for (const item of columnsToAdd) {
        const { table, column, type } = item;

        const checkSql = `SHOW COLUMNS FROM ${table} LIKE '${column}'`;
        const hasColumn = await new Promise((resolve) => {
            db.query(checkSql, (err, rows) => {
                if (err) resolve(false);
                else resolve(rows.length > 0);
            });
        });

        if (!hasColumn) {
            console.log(`Adding column ${column} to ${table}...`);
            const addSql = `ALTER TABLE ${table} ADD COLUMN ${column} ${type}`;
            await new Promise((resolve) => {
                db.query(addSql, (err) => {
                    if (err) console.error(`Error adding ${column} to ${table}:`, err.message);
                    else console.log(`Successfully added ${column} to ${table}.`);
                    resolve();
                });
            });
        } else {
            console.log(`Column ${column} already exists in ${table}.`);
        }
    }
    process.exit();
}

run();
