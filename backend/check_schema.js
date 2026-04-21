import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "14043011",
    database: process.env.DB_NAME || "garments",
    port: process.env.DB_PORT || 3306,
};

async function checkSchema() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute("DESCRIBE invoices");
        console.log("Columns in 'invoices' table:");
        rows.forEach(row => console.log(row.Field));

        const columnsToAdd = [
            { name: 'mode_of_payment', type: 'VARCHAR(255)', after: 'payment_type' },
            { name: 'bank_account', type: 'VARCHAR(255)', after: 'mode_of_payment' },
            { name: 'staff_name', type: 'VARCHAR(255)', after: 'bank_account' },
            { name: 'upi_id', type: 'VARCHAR(255)', after: 'staff_name' }
        ];

        for (const col of columnsToAdd) {
            const hasColumn = rows.some(row => row.Field === col.name);
            if (!hasColumn) {
                console.log(`Column '${col.name}' is missing. Adding it...`);
                await connection.execute(`ALTER TABLE invoices ADD COLUMN ${col.name} ${col.type} AFTER ${col.after}`);
                console.log(`Column '${col.name}' added successfully.`);
            } else {
                console.log(`Column '${col.name}' already exists.`);
            }
        }
    } catch (error) {
        console.error("Error checking schema:", error);
    } finally {
        await connection.end();
    }
}

checkSchema();
