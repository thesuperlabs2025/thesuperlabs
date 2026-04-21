import express from "express";
import db from "../db.js";

const router = express.Router();
const formatDate = (d) => !d ? "" : new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

router.get("/grn/:id", (req, res) => {
    const id = req.params.id;
    db.query("SELECT * FROM trims_grn WHERE id = ?", [id], (err, grnRows) => {
        if (err) return res.status(500).send("Error");
        if (!grnRows || grnRows.length === 0) return res.status(404).send("Trims GRN not found");
        const grn = grnRows[0];
        db.query("SELECT * FROM trims_grn_items WHERE grn_id = ?", [id], (err, items) => {
            if (err) return res.status(500).send("Error");
            const totalQty = (items || []).reduce((s, i) => s + (parseFloat(i.qty) || 0), 0);
            const esc = (x) => (x || "").toString().replace(/</g, "&lt;");
            const rows = (items || []).map((i, idx) =>
                "<tr><td>" + (idx + 1) + "</td><td>" + esc(i.trims_name || i.trims_sku) + "</td><td>" + esc(i.color) + "</td><td>" + esc(i.size) + "</td><td class=\"right\">" + parseFloat(i.qty || 0).toFixed(3) + "</td></tr>"
            ).join("");
            const html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>*{print-color-adjust:exact} body{font-family:\"Segoe UI\",Arial;font-size:11px;margin:16px;} .header{display:flex;justify-content:space-between;} table{width:100%;border-collapse:collapse;} th{background:#000;color:#fff;padding:6px 8px;} td{padding:6px 8px;border-bottom:1px solid #ddd;} td.right{text-align:right;}</style></head><body><div class=\"header\"><div><strong>TRIMS GOODS RECEIPT (GRN)</strong><br/>GRN No: " + esc(grn.grn_no) + " | Date: " + formatDate(grn.grn_date) + "</div><div style=\"text-align:right\">Supplier: " + esc(grn.supplier_name) + "<br/>DC No: " + esc(grn.dc_no) + "<br/>Staff: " + esc(grn.staff_name) + "<br/>PO: " + esc(grn.po_no) + "</div></div><table><thead><tr><th>#</th><th>Trims / SKU</th><th>Color</th><th>Size</th><th class=\"right\">Qty</th></tr></thead><tbody>" + rows + "</tbody><tfoot><tr><td colspan=\"4\" class=\"right\"><strong>Total Qty:</strong></td><td class=\"right\"><strong>" + totalQty.toFixed(3) + "</strong></td></tr></tfoot></table>" + (grn.remarks ? "<p><strong>Remarks:</strong> " + esc(grn.remarks) + "</p>" : "") + "</body></html>";
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.send(html);
        });
    });
});

export default router;
