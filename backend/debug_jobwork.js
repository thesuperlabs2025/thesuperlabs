import db from "./db.js";

async function checkJobwork() {
    try {
        const [rows] = await db.promise().query("SELECT * FROM job_outward_item_processes WHERE order_no = '6'");
        console.log("Order 6 Jobwork Outward:", rows);
        const [rows2] = await db.promise().query("SELECT * FROM job_inward_item_processes WHERE order_no = '6'");
        console.log("Order 6 Jobwork Inward:", rows2);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkJobwork();
