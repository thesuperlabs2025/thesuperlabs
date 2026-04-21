import mysql from 'mysql2';

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "14043011",
    database: "garments"
});

const run = async () => {
    try {
        await db.promise().query('ALTER TABLE size_quantity_items ADD COLUMN style_part VARCHAR(100) AFTER style_name');
        console.log('Column style_part added successfully');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column style_part already exists');
        } else {
            console.error(err);
        }
    }
    process.exit();
};

run();
