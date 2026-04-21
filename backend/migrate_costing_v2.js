import db from "./db.js";

const runMigrations = async () => {
    const conn = db.promise();

    const addColumn = async (table, col, definition) => {
        try {
            await conn.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${definition}`);
            console.log(`Added column ${col} to ${table}`);
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log(`Column ${col} already exists in ${table}`);
            } else {
                console.error(`Error adding ${col} to ${table}:`, err.message);
            }
        }
    };

    await addColumn('garment_costing', 'version', 'VARCHAR(50) AFTER status');
    await addColumn('garment_costing', 'delivery_date', 'DATE AFTER target_fob');
    await addColumn('garment_costing_fabrics', 'gsm', 'VARCHAR(50) AFTER fabric_name');
    await addColumn('garment_costing_processes', 'basis', 'VARCHAR(50) AFTER process_name');
    await addColumn('garment_costing_processes', 'rate', 'DECIMAL(15, 2) AFTER basis');

    process.exit();
};

runMigrations();
