require('dotenv').config({ path: './backend/.env' });
const mysql = require('mysql2/promise');

async function run() {
    console.log("Connecting to the database...");
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const ORDER_ID = 21;
    console.log(`Inserting dummy data for Order ID: ${ORDER_ID}`);

    // Insert Garment Costing
    try {
        await conn.execute(`
            INSERT INTO garment_costing (order_planning_id, buyer_name, style_no, cm_cost, overhead_pct, profit_pct, total_cost, final_fob)
            VALUES (?, 'Tommy Hilfiger', 'TH-SUM-01', 120.00, 5.0, 15.0, 480.00, 552.00)
            ON DUPLICATE KEY UPDATE cm_cost=120.00;
        `, [ORDER_ID]);
        console.log("Costing dummy data added.");
    } catch (e) {
        console.error("Costing error:", e.message);
    }

    // Insert Size Quantities
    try {
        await conn.execute(`
            INSERT INTO style_colors (order_planning_id, color_name) VALUES (?, 'Navy Blue')
            ON DUPLICATE KEY UPDATE color_name='Navy Blue';
        `, [ORDER_ID]);

        const [colors] = await conn.execute('SELECT id FROM style_colors WHERE order_planning_id=? LIMIT 1', [ORDER_ID]);
        if (colors.length > 0) {
            const colorId = colors[0].id;
            await conn.execute(`
                INSERT INTO size_quantities (order_planning_id, color_id, size_name, qty, ratio)
                VALUES (?, ?, 'M', 500, 1), (?, ?, 'L', 1000, 2)
            `, [ORDER_ID, colorId, ORDER_ID, colorId]);
        }
        console.log("Size Quantities dummy data added.");
    } catch (e) {
        console.error("Size qties error:", e.message);
    }

    // Insert Fabric Planning
    try {
        await conn.execute(`
            INSERT INTO fabric_planning (order_planning_id, fabric_name, req_qty, supplier_name)
            VALUES (?, '100% Cotton Single Jersey', 2500.00, 'Tirupur Textiles')
        `, [ORDER_ID]);
        console.log("Fabric Planning dummy data added.");
    } catch (e) {
        console.error("Fabric Planning error:", e.message);
    }

    // Insert Yarn Planning
    try {
        await conn.execute(`
            INSERT INTO order_yarn_planning (order_id, yarn_type, per_kg, total_req)
            VALUES (?, 'Combed Yarn 30s', 250.00, 800.00)
        `, [ORDER_ID]);
        console.log("Yarn Planning dummy data added.");
    } catch (e) {
        console.error("Yarn Planning error:", e.message);
    }

    // Insert Trims Planning
    try {
        await conn.execute(`
            INSERT INTO order_trims_planning (order_id, trim_type, per_piece, cost)
            VALUES (?, 'Main Label', 1, 2.50)
        `, [ORDER_ID]);
        console.log("Trims Planning dummy data added.");
    } catch (e) {
        console.error("Trims Planning error:", e.message);
    }

    // Insert BOM
    try {
        await conn.execute(`
            INSERT INTO order_bom (order_id, material_type, item_name, req_qty, estimated_cost)
            VALUES (?, 'Fabric', '100% Cotton Single Jersey', 2500, 45000.00)
        `, [ORDER_ID]);
        console.log("BOM dummy data added.");
    } catch (e) {
        console.error("BOM error:", e.message);
    }

    await conn.end();
    console.log("Done inserting dummy data.");
}

run().catch(console.error);
