import db from "./db.js";

async function checkMasterLifeCycles() {
    try {
        const [rows] = await db.promise().query("SELECT * FROM life_cycles");
        console.log("Master Life Cycles:");
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkMasterLifeCycles();
