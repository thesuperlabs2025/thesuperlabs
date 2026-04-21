import express from "express";
import html_to_pdf from "html-pdf-node";
import db from "../db.js";

const router = express.Router();

/* ===== DATE FORMAT ===== */
const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}-${String(
        d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
};

/* ===== PRINT ESTIMATE ===== */
router.get("/estimate/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const estimate = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM estimate WHERE id = ?", [id], (e, r) =>
                e ? reject(e) : resolve(r[0])
            );
        });
        if (!estimate) return res.status(404).send("Estimate not found");

        const customer = await new Promise((resolve, reject) => {
            db.query(
                "SELECT * FROM customers WHERE name = ?",
                [estimate.customer_name],
                (e, r) => (e ? reject(e) : resolve(r[0]))
            );
        });

        const items = await new Promise((resolve, reject) => {
            db.query(
                "SELECT * FROM estimate_items WHERE estimate_id = ?",
                [id],
                (e, r) => (e ? reject(e) : resolve(r))
            );
        });

        /* ===== CALCULATIONS ===== */
        const subTotal = items.reduce(
            (s, i) => s + Number(i.qty) * Number(i.rate),
            0
        );
        const discount = Number(estimate.discount_total || 0);

        const gstTotal = items.reduce(
            (s, i) => s + (Number(i.total) - Number(i.qty) * Number(i.rate)),
            0
        );
        const cgst = gstTotal / 2;
        const sgst = gstTotal / 2;

        const roundedTotal = Math.round(estimate.grand_total);
        const roundOff = roundedTotal - estimate.grand_total;

        /* ===== HTML ===== */
        const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
*{print-color-adjust:exact;-webkit-print-color-adjust:exact}
body{
  font-family:"Segoe UI",Arial;
  font-size:11.5px;
  color:#222;
}
.header{display:flex;justify-content:space-between}
.company-name{font-size:18px;font-weight:700}
.small{font-size:11px;line-height:1.5}
.invoice-title{text-align:right;font-weight:700}
.hr{border-top:1px solid #ccc;margin:10px 0}

/* BILL & SHIP */
.bill-ship{
  display:flex;
  border:1px solid #ddd;
}
.bill-ship .col{
  width:50%;
  padding:10px;
}
.bill-ship .center-line{
  width:1px;
  background:#ccc;
}

/* TABLE */
table{width:100%;border-collapse:collapse}
th{
  background:#000;
  color:#fff;
  padding:6px;
  font-size:11px;
}
td{
  padding:6px;
  border-bottom:1px solid #e6e6e6;
}
td.right{text-align:right}
tr:nth-child(even) td{background:#f5f5f5}

/* BOXES */
.flex{display:flex;gap:20px;margin-top:14px}
.box{
  border:1px solid #ddd;
  padding:10px;
}
.box h4{
  margin:0 0 6px 0;
  font-size:12px;
  font-weight:600;
}
.totals td{
  border:none;
  padding:4px 0;
}
.totals tr:last-child td{
  font-weight:700;
  border-top:1px solid #ccc;
  padding-top:6px;
}

.footer{
  margin-top:20px;
  background:#0d6efd;
  color:#fff;
  text-align:center;
  padding:10px;
  font-weight:600;
}
</style>
</head>

<body>

<!-- HEADER -->
<div class="header">
  <div>
    <div class="company-name">SUPER LABS</div>
    <div class="small">
      No 12, Anna Nagar, Chennai – 600040<br>
      GSTIN: 33ABCDE1234F1Z5<br>
      Mobile: 9876543210
    </div>
  </div>
  <div class="invoice-title">
    ESTIMATE<br>
    <span class="small">
      Estimate No: ${estimate.id}<br>
      Date: ${formatDate(estimate.estimate_date)}
    </span>
  </div>
</div>

<div class="hr"></div>

<!-- BILL / SHIP -->
<div class="bill-ship small">
  <div class="col">
    <b>Bill To</b><br>
    ${estimate.customer_name}<br>
    ${customer?.mobile || ""}<br>
    ${customer?.billing_address || ""}
  </div>

  <div class="center-line"></div>

  <div class="col">
    <b>Ship To</b><br>
    ${estimate.customer_name}<br>
    ${customer?.mobile || ""}<br>
    ${customer?.shipping_address || ""}
  </div>
</div>

<!-- ITEMS -->
<table style="margin-top:12px">
<tr>
  <th>S.No</th>
  <th>Description</th>

  <th>Qty</th>
  <th>Rate</th>
  <th>GST%</th>
  <th class="right">Amount</th>
</tr>
${items.map((i, idx) => `
<tr>
  <td>${idx + 1}</td>
  <td>${i.description || i.sku}</td>
 
  <td>${i.qty}</td>
  <td class="right">${Number(i.rate).toFixed(2)}</td>
  <td class="right">${i.gst_percent}</td>
  <td class="right">${Number(i.total).toFixed(2)}</td>
</tr>`).join("")}
</table>

<!-- BANK + TOTAL -->
<div class="flex">
  <div class="box small" style="width:50%">
    <h4>Bank Details</h4>
    Bank: Canara Bank<br>
    A/C Name: Super Labs<br>
    A/C No: 89451325645<br>
    IFSC: CAN848912<br>
    Branch: TUP
  </div>

  <div class="box totals" style="width:50%">
    <table>
      <tr><td>Sub Total</td><td class="right">${subTotal.toFixed(2)}</td></tr>
      <tr><td>Discount</td><td class="right">${discount.toFixed(2)}</td></tr>
      <tr><td>CGST</td><td class="right">${cgst.toFixed(2)}</td></tr>
      <tr><td>SGST</td><td class="right">${sgst.toFixed(2)}</td></tr>
      <tr><td>Round Off</td><td class="right">${roundOff.toFixed(2)}</td></tr>
      <tr><td>Total</td><td class="right">₹ ${roundedTotal.toFixed(2)}</td></tr>
    </table>
  </div>
</div>

<!-- FOOTER -->
<div class="footer">
  Thank you for the business
</div>

</body>
</html>
`;

        const pdf = await html_to_pdf.generatePdf(
            { content: html },
            { format: "A4", printBackground: true }
        );

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=estimate-${id}.pdf`);
        res.send(pdf);

    } catch (err) {
        console.error(err);
        res.status(500).send("Estimate print failed");
    }
});

export default router;
