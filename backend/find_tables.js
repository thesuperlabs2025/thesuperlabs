import db from "./db.js";

async function findTables() {
    try {
        const [rows] = await db.promise().query("SHOW TABLES");
        const tables = rows.map(r => Object.values(r)[0]);
        console.log("TABLES:", tables.join(", "));
        
        const search = ['credit', 'debit', 'estimate', 'quotation'];
        search.forEach(s => {
            const found = tables.filter(t => t.toLowerCase().includes(s));
            console.log(`Search '${s}':`, found.join(", "));
        });
    } catch (err) {
        console.error(err);
    }
    process.exit();
}

findTables();
