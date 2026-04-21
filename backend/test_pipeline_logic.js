
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

    try {
        const ordersMap = rows.reduce((acc, curr) => {
            if (!acc[curr.order_no]) {
                acc[curr.order_no] = {
                    order_no: curr.order_no,
                    style_name: curr.order_name,
                    steps: []
                };
            }

            const inQty = parseFloat(curr.inward_qty) || 0;
            const targetQty = parseFloat(curr.target_qty) || 0;
            let status = curr.tna_status || 'Not Started';

            // Precision status based on quantities
            if (targetQty > 0) {
                if (inQty >= targetQty * 0.98) status = 'Completed'; // 98% tolerance
                else if (inQty > 0) status = 'In Progress';
            } else if (inQty > 0) {
                if (status !== 'Completed') status = 'In Progress';
            }

            const unit = (
                curr.process_name.toLowerCase().includes('yarn') ||
                curr.process_name.toLowerCase().includes('knit') ||
                curr.process_name.toLowerCase().includes('dye') ||
                curr.process_name.toLowerCase().includes('fabric') ||
                curr.process_name.toLowerCase().includes('compact')
            ) ? 'Kgs' : 'Pcs';

            acc[curr.order_no].steps.push({
                name: curr.process_name,
                seq: curr.sequence_no,
                in_qty: inQty,
                target_qty: targetQty,
                status: status,
                unit: unit
            });

            return acc;
        }, {});

        const result = Object.values(ordersMap).map(order => {
            const steps = order.steps.sort((a, b) => a.seq - b.seq);

            let totalStepProgress = 0;
            steps.forEach(s => {
                if (s.status === 'Completed') {
                    totalStepProgress += 1;
                } else if (s.status === 'In Progress') {
                    const ratio = s.target_qty > 0 ? (s.in_qty / s.target_qty) : 0.5;
                    totalStepProgress += Math.min(0.9, ratio); // Cap in-progress step at 90%
                }
            });

            const percentage = Math.round((totalStepProgress / (steps.length || 1)) * 100);

            // Current step: the first one that is NOT completed
            const currentStep = steps.find(s => s.status !== 'Completed') || steps[steps.length - 1];

            return {
                ...order,
                steps: steps,
                percentage: Math.min(percentage, 100),
                current_step: currentStep ? currentStep.name : 'Finished'
            };
        });

        console.log("SUCCESS, processed orders count:", result.length);
        process.exit(0);
    } catch (e) {
        console.error("PROCESSING ERROR:", e);
        process.exit(1);
    }
});
