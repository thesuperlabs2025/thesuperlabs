import db from "./db.js";

async function checkYears() {
    try {
        const [rows] = await db.promise().query("SELECT * FROM accounting_years");
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    }
    process.exit();
}

checkYears();
