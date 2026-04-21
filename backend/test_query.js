import db from './db.js';
async function testQuery() {
    const order_no = '1';
    const process = '';
    const fromDate = '';
    const toDate = '';

    let sql = `
        SELECT 
            combined.order_no, 
            combined.order_name, 
            combined.party_name as company_name, 
            combined.process,
            SUM(combined.outward_qty) as total_outward,
            SUM(combined.inward_qty) as total_inward,
            SUM(combined.return_qty) as total_return,
            (SUM(combined.outward_qty) - SUM(combined.inward_qty) - SUM(combined.return_qty)) as balance,
            MAX(combined.activity_date) as last_date
        FROM (
            SELECT order_no, order_name, party_name, process, total_pcs as outward_qty, 0 as inward_qty, 0 as return_qty, outward_date as activity_date FROM pcs_outward
            UNION ALL
            SELECT order_no, order_name, party_name, process, 0 as outward_qty, total_pcs as inward_qty, 0 as return_qty, inward_date as activity_date FROM pcs_inward
            UNION ALL
            SELECT order_no, order_name, party_name, process, 0 as outward_qty, 0 as inward_qty, total_pcs as return_qty, return_date as activity_date FROM pcs_return
        ) AS combined
        WHERE 1=1
    `;

    const params = [];
    if (order_no) { sql += " AND combined.order_no = ?"; params.push(order_no); }
    if (process) { sql += " AND combined.process = ?"; params.push(process); }
    if (fromDate) { sql += " AND combined.activity_date >= ?"; params.push(fromDate); }
    if (toDate) { sql += " AND combined.activity_date <= ?"; params.push(toDate); }

    sql += " GROUP BY combined.order_no, combined.order_name, combined.party_name, combined.process ORDER BY last_date DESC";

    try {
        const [rows] = await db.promise().query(sql, params);
        console.log("Success:", rows.length, "rows");
    } catch (err) {
        console.error("Query Error:", err);
    }
    process.exit();
}
testQuery();
