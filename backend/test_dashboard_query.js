
import db from "./db.js";

const sql = `
    SELECT 
      op.id as order_id, op.order_no, op.order_name, op.style_type as style_name,
      lc.process_name, lc.sequence_no,
      (
        SELECT IFNULL(SUM(qty), 0) FROM (
          SELECT order_no, process, total_pcs as qty FROM pcs_inward
          UNION ALL SELECT order_no, process, total_qty as qty FROM fabric_to_pcs_inward
          UNION ALL SELECT order_no, process, total_qty as qty FROM yarn_dyeing_inward
          UNION ALL SELECT j.order_no, jp.process_name as process, ji.received_weight as qty 
          FROM job_inward j 
          JOIN job_inward_items ji ON ji.inward_id = j.id 
          JOIN job_inward_item_processes jp ON jp.item_id = ji.id
        ) as all_in 
        WHERE all_in.order_no = op.order_no AND all_in.process = lc.process_name
      ) as inward_qty,
      (
        SELECT IFNULL(SUM(qty), 0) FROM (
          SELECT order_no, process, total_pcs as qty FROM pcs_outward
          UNION ALL SELECT order_no, process, total_qty as qty FROM fabric_to_pcs_outward
          UNION ALL SELECT order_no, process, total_qty as qty FROM yarn_dyeing_outward
          UNION ALL SELECT j.order_no, jp.process_name as process, ji.outward_weight as qty 
          FROM job_outward j 
          JOIN job_outward_items ji ON ji.outward_id = j.id 
          JOIN job_outward_item_processes jp ON jp.outward_item_id = ji.id
        ) as all_out
        WHERE all_out.order_no = op.order_no AND all_out.process = lc.process_name
      ) as target_qty,
      (SELECT tp.status FROM tna_processes tp JOIN tna_headers th ON tp.tna_id = th.id WHERE th.order_no = op.order_no AND tp.process_name = lc.process_name LIMIT 1) as tna_status
    FROM order_planning op
    JOIN order_lifecycle lc ON lc.order_id = op.id
    WHERE op.status = 'Approved' OR op.status = 'In Progress'
    ORDER BY op.id, lc.sequence_no
`;

db.query(sql, (err, rows) => {
    if (err) {
        console.error("QUERY ERROR:", err);
        process.exit(1);
    }
    console.log("QUERY SUCCESS, rows count:", rows.length);
    process.exit(0);
});
