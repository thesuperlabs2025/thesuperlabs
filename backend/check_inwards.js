import db from "./db.js";

async function checkInwards() {
    try {
        const [rows] = await db.promise().query("SELECT * FROM fabric_to_pcs_inward");
        console.log("Inwards:");
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkInwards();
