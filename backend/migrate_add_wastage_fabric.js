import mysql from 'mysql2';

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
});

db.connect(err => {
    if (err) throw err;
    console.log("Connected to database");

    const sql = "ALTER TABLE fabric_planning ADD COLUMN wastage_pct DECIMAL(5,2) DEFAULT 0.00";
    db.query(sql, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_COLUMN_NAME') {
                console.log("Column wastage_pct already exists in fabric_planning");
            } else {
                console.error(err);
            }
        } else {
            console.log("Column wastage_pct added to fabric_planning");
        }
        db.end();
    });
});
