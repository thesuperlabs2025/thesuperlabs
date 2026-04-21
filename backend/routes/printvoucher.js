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

/* ===== PRINT VOUCHER ===== */
router.get("/voucher/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const voucher = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM vouchers WHERE id = ?", [id], (e, r) =>
        e ? reject(e) : resolve(r[0])
      );
    });
    if (!voucher) return res.status(404).send("Voucher not found");

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
  font-size:12px;
  color:#222;
  margin:40px;
}
.header{display:flex;justify-content:space-between}
.company-name{font-size:20px;font-weight:700}
.small{font-size:12px;line-height:1.5}
.title{text-align:center;font-size:18px;font-weight:700;text-decoration:underline;margin:20px 0}
.hr{border-top:1px solid #ccc;margin:10px 0}

.content-row{display:flex;margin:10px 0;line-height:2}
.label{width:150px;font-weight:600}
.value{flex:1;border-bottom:1px dotted #888}

.footer{
  margin-top:50px;
  display:flex;
  justify-content:space-between;
}
.sig{border-top:1px solid #000;width:180px;text-align:center;padding-top:5px;margin-top:40px}
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
  <div style="text-align:right">
    No: ${voucher.id}<br>
    Date: ${formatDate(voucher.VoucherDate)}
  </div>
</div>

<div class="title">PAYMENT VOUCHER</div>

<div class="content-row">
  <div class="label">Paid To:</div>
  <div class="value">${voucher.SupplierName || voucher.supplier_name || voucher.supplierName || "N/A"}</div>
</div>

<div class="content-row">
  <div class="label">Amount:</div>
  <div class="value">₹ ${Number(voucher.Amount).toFixed(2)}</div>
</div>

<div class="content-row">
  <div class="label">Payment Mode:</div>
  <div class="value">${voucher.ModeOfPayment || "N/A"}</div>
</div>

<div class="content-row">
  <div class="label">Particulars:</div>
  <div class="value">${voucher.SupplierName || voucher.supplier_name || ""} - ${voucher.Details || ""}</div>
</div>

<div class="content-row">
  <div class="label">Remarks:</div>
  <div class="value">${voucher.Details || "N/A"}</div>
</div>

<div class="footer">
  <div class="sig">Receiver's Signature</div>
  <div class="sig">Authorized Signature</div>
</div>

</body>
</html>
`;

    const pdf = await html_to_pdf.generatePdf(
      { content: html },
      { format: "A4", printBackground: true }
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=voucher-${id}.pdf`);
    res.send(pdf);

  } catch (err) {
    console.error(err);
    res.status(500).send("Voucher print failed");
  }
});

export default router;
