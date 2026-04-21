import db from "./db.js";

async function checkLifecycle() {
    try {
        const [orders] = await db.promise().query("SELECT id FROM order_planning WHERE order_no = '1' LIMIT 1");
        if (!orders.length) {
            console.log("Order 1 not found");
            process.exit(0);
        }
        const order_id = orders[0].id;
        const [lifecycle] = await db.promise().query("SELECT * FROM order_lifecycle WHERE order_id = ? ORDER BY sequence_no ASC, id ASC", [order_id]);
        console.log("Lifecycle for Order 1 (ID: " + order_id + "):");
        console.table(lifecycle);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkLifecycle();
