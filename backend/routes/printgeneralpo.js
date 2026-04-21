import express from "express";
import db from "../db.js";

const router = express.Router();
const formatDate = (d) => !d ? "" : new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

router.get("/po/:id", (req, res) => {
    const id = req.params.id;
    db.query("SELECT * FROM general_po WHERE id = ?", [id], (err, poRows) => {
        if (err) return res.status(500).send("Error");
        if (!poRows || poRows.length === 0) return res.status(404).send("General PO not found");
        const po = poRows[0];
        db.query("SELECT * FROM general_po_items WHERE po_id = ?", [id], (err, items) => {
            if (err) return res.status(500).send("Error");
            const totalQty = (items || []).reduce((s, i) => s + (parseFloat(i.qty) || 0), 0);
            const desc = (i) => [i.yarn_name, i.fabric_name, i.trims_name].filter(Boolean).join(" / ") || "—";
            const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{print-color-adjust:exact;-webkit-print-color-adjust:exact} body{font-family:"Segoe UI",Arial;font-size:11px;color:#222;margin:16px;}
.header{display:flex;justify-content:space-between;margin-bottom:16px;}
.company{font-size:16px;font-weight:700;}
.title{text-align:right;font-weight:700;}
table{width:100%;border-collapse:collapse;} th{background:#000;color:#fff;padding:6px 8px;text-align:left;font-size:10px;}
td{padding:6px 8px;border-bottom:1px solid #ddd;} td.right{text-align:right;}
</style></head><body>
<div class="header"><div><div class="company">GENERAL PURCHASE ORDER (${(po.po_type || "").replace(/</g, "&lt;")})</div><div>PO No: ${po.po_no || ""} | Date: ${formatDate(po.create_date)}</div></div>
<div class="title">Supplier: ${(po.supplier_name || "").replace(/</g, "&lt;")}<br/>Staff: ${(po.staff_name || "").replace(/</g, "&lt;")}<br/>${po.order_no ? "Order: " + po.order_no : ""} ${po.lot_no ? "Lot: " + po.lot_no : ""}</div></div>
<table><thead><tr><th>#</th><th>Description</th><th>Color</th><th>Size</th><th class="right">Qty</th><th class="right">Rate</th><th class="right">Total</th></tr></thead><tbody>
${(items || []).map((i, idx) => `<tr><td>${idx + 1}</td><td>${desc(i).replace(/</g, "&lt;")}</td><td>${(i.color || "").replace(/</g, "&lt;")}</td><td>${(i.size || "").replace(/</g, "&lt;")}</td><td class="right">${parseFloat(i.qty || 0).toFixed(3)}</td><td class="right">${parseFloat(i.rate || 0).toFixed(2)}</td><td class="right">${parseFloat(i.total || 0).toFixed(2)}</td></tr>`).join("")}
</tbody><tfoot><tr><td colspan="4" class="right"><strong>Total Qty:</strong></td><td class="right"><strong>${totalQty.toFixed(3)}</strong></td><td colspan="2"></td></tr></tfoot></table>
${po.remarks ? "<p><strong>Remarks:</strong> " + (po.remarks || "").replace(/</g, "&lt;") + "</p>" : ""}
</body></html>`;
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.send(html);
        });
    });
});

export default router;
