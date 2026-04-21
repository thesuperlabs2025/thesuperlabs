import express from "express";
import db from "../db.js";
import PDFDocument from "pdfkit";

const router = express.Router();

// ✅ Generate and download invoice PDF
router.get("/invoice-pdf/:id", (req, res) => {
  const { id } = req.params;

  // Fetch invoice
  db.query("SELECT * FROM invoices WHERE id = ?", [id], (err, invoices) => {
    if (err) {
      console.error("❌ DB error:", err);
      return res.status(500).send("Database error");
    }

    if (invoices.length === 0) return res.status(404).send("Invoice not found");

    const invoice = invoices[0];

    // Fetch invoice items
    db.query("SELECT * FROM invoice_items WHERE invoice_id = ?", [id], (err, items) => {
      if (err) {
        console.error("❌ Item fetch error:", err);
        return res.status(500).send("Item fetch failed");
      }

      // ✅ Create PDF
      const doc = new PDFDocument({ margin: 40 });
      const filename = `invoice_${id}.pdf`;

      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/pdf");
      doc.pipe(res);

      // ===========================================================
      // 🧾 HEADER (Company Info)
      // ===========================================================
      doc
        .fontSize(22)
        .fillColor("#007bff")
        .text("TEST", { align: "left" })
        .fillColor("black")
        .fontSize(10)
        .text("123 Main Street, City, State, 600001")
        .text("Phone: +91 98765 43210")
        .text("GSTIN: 33TEST1234XYZ")
        .moveDown();

      // Blue line divider (Bootstrap style)
      doc
        .moveTo(40, 120)
        .lineTo(550, 120)
        .strokeColor("#007bff")
        .lineWidth(2)
        .stroke();

      // ===========================================================
      // 📄 INVOICE DETAILS
      // ===========================================================
      doc
        .fontSize(16)
        .fillColor("#212529")
        .text("INVOICE", 0, 130, { align: "center" })
        .moveDown();

      doc.fontSize(10).fillColor("black");
      doc.text(`Invoice No: ${invoice.id}`, 40, 160);
      doc.text(`Invoice Date: ${invoice.create_date}`, 400, 160);
      doc.text(`Customer: ${invoice.customer_name}`, 40, 175);
      doc.text(`Sales Person: ${invoice.sales_person}`, 400, 175);

      // ===========================================================
      // 🧱 TABLE HEADER
      // ===========================================================
      const tableTop = 210;
      const columnPositions = [40, 80, 250, 310, 370, 440, 510];

      // Draw header background
      doc
        .rect(40, tableTop, 510, 20)
        .fill("#007bff")
        .fillColor("white")
        .fontSize(10)
        .text("S.No", columnPositions[0] + 5, tableTop + 5)
        .text("Description", columnPositions[1] + 5, tableTop + 5)
        .text("Qty", columnPositions[2] + 5, tableTop + 5)
        .text("Rate", columnPositions[3] + 5, tableTop + 5)
        .text("Tax %", columnPositions[4] + 5, tableTop + 5)
        .text("Total", columnPositions[5] + 5, tableTop + 5);

      // Reset for table body
      doc.fillColor("black");
      let y = tableTop + 25;

      // ===========================================================
      // 📊 TABLE ROWS
      // ===========================================================
      items.forEach((item, i) => {
        const rowHeight = 20;
        const isEven = i % 2 === 0;
        doc.rect(40, y - 2, 510, rowHeight).fill(isEven ? "#f8f9fa" : "#ffffff").fillColor("black");

        doc
          .fontSize(10)
          .text(i + 1, columnPositions[0] + 5, y + 3)
          .text(item.product_name, columnPositions[1] + 5, y + 3)
          .text(item.qty.toString(), columnPositions[2] + 5, y + 3, { width: 40, align: "right" })
          .text(item.rate.toFixed(2), columnPositions[3] + 5, y + 3, { width: 50, align: "right" })
          .text(item.tax_percentage.toFixed(2), columnPositions[4] + 5, y + 3, { width: 50, align: "right" })
          .text(item.total_amount.toFixed(2), columnPositions[5] + 5, y + 3, { width: 50, align: "right" });

        y += rowHeight;
      });

      // ===========================================================
      // 💰 TOTALS SECTION
      // ===========================================================
      doc.moveDown(2);
      y += 10;
      doc
        .fontSize(11)
        .fillColor("black")
        .text(`Total Qty: ${invoice.total_qty || 0}`, 400, y)
        .text(`Discount: ₹${invoice.discount_total || 0}`, 400, y + 15)
        .text(`Grand Total: ₹${invoice.grand_total || 0}`, 400, y + 30, {
          align: "left",
        });

      // Line before footer
      doc
        .moveTo(40, y + 55)
        .lineTo(550, y + 55)
        .strokeColor("#007bff")
        .lineWidth(1)
        .stroke();

      // ===========================================================
      // 🧾 FOOTER
      // ===========================================================
      doc
        .fontSize(9)
        .fillColor("#6c757d")
        .text("Thank you for your business!", 0, y + 65, { align: "center" })
        .text("This invoice was generated by TEST ERP System.", 0, y + 80, { align: "center" });

      // ✅ End the document
      doc.end();
    });
  });
});

export default router;
