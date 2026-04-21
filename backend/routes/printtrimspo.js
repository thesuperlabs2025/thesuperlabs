import express from "express";
import db from "../db.js";

const router = express.Router();
const formatDate = (d) => !d ? "" : new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

router.get("/po/:id", (req, res) => {
    const id = req.params.id;
    db.query("SELECT * FROM trims_po WHERE id = ?", [id], (err, poRows) => {
        if (err) return res.status(500).send("Error");
        if (!poRows || poRows.length === 0) return res.status(404).send("Trims PO not found");
        const po = poRows[0];
        db.query("SELECT * FROM trims_po_items WHERE po_id = ?", [id], (err, items) => {
            if (err) return res.status(500).send("Error");
            const totalQty = (items || []).reduce((s, i) => s + (parseFloat(i.qty) || 0), 0);
            const esc = (x) => (x || "").toString().replace(/</g, "&lt;");
            const rows = (items || []).map((i, idx) =>
                "<tr><td>" + (idx + 1) + "</td><td>" + esc(i.trims_name || i.trims_sku) + "</td><td>" + esc(i.color) + "</td><td>" + esc(i.size) + "</td><td class=\"right\">" + parseFloat(i.qty || 0).toFixed(3) + "</td><td class=\"right\">" + parseFloat(i.rate || 0).toFixed(2) + "</td><td class=\"right\">" + parseFloat(i.total || 0).toFixed(2) + "</td></tr>"
            ).join("");
            const html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>*{print-color-adjust:exact} body{font-family:\"Segoe UI\",Arial;font-size:11px;margin:16px;} .header{display:flex;justify-content:space-between;} table{width:100%;border-collapse:collapse;} th{background:#000;color:#fff;padding:6px 8px;} td{padding:6px 8px;border-bottom:1px solid #ddd;} td.right{text-align:right;}</style></head><body><div class=\"header\"><div><strong>TRIMS PURCHASE ORDER</strong><br/>PO No: " + esc(po.po_no) + " | Date: " + formatDate(po.create_date) + "</div><div style=\"text-align:right\">Supplier: " + esc(po.supplier_name) + "<br/>Staff: " + esc(po.staff_name) + "</div></div><table><thead><tr><th>#</th><th>Trims / SKU</th><th>Color</th><th>Size</th><th class=\"right\">Qty</th><th class=\"right\">Rate</th><th class=\"right\">Total</th></tr></thead><tbody>" + rows + "</tbody><tfoot><tr><td colspan=\"4\" class=\"right\"><strong>Total Qty:</strong></td><td class=\"right\"><strong>" + totalQty.toFixed(3) + "</strong></td><td colspan=\"2\"></td></tr></tfoot></table>" + (po.remarks ? "<p><strong>Remarks:</strong> " + esc(po.remarks) + "</p>" : "") + "</body></html>";
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.send(html);
        });
    });
});

export default router;
