import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";



const router = express.Router();


// Get next Invoice number
router.get("/next-invoice-no", async (req, res) => {
  const yearId = req.headers['x-year-id'];
  try {
    const [rows] = await db
      .promise()
      .query(
        `
        SELECT id
        FROM invoices
        WHERE year_id = ?
        ORDER BY id DESC
        LIMIT 1
        `,
        [yearId]
      );

    const lastNo = rows.length > 0 ? rows[0].id : 0;
    const nextNo = lastNo + 1;

    res.json({ invoiceNo: nextNo, lastInvoiceNo: lastNo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/check-manual-no/:no", async (req, res) => {
  const { no } = req.params;
  try {
    const [rows] = await db.promise().query(
      "SELECT id FROM invoices WHERE id = ? OR manual_invoice_no = ?",
      [no, no]
    );
    if (rows.length > 0) {
      res.json({ exists: true, id: rows[0].id });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/payment-progress", (req, res) => {


  const invoiceId = Number(req.query.invoiceId);


  if (!invoiceId) {
    return res.status(400).json({ message: "Invoice ID required" });
  }

  const sql = `
    SELECT
       i.id AS invoice_id,
       i.grand_total,
       IFNULL(SUM(r.TransactionAmount), 0) AS total_paid,
      ROUND(
        IFNULL(
          (SUM(r.TransactionAmount) / NULLIF(i.grand_total, 0)) * 100,
          0
        ),
        2
       ) AS payment_percentage
     FROM invoices i
     LEFT JOIN receipts r
       ON r.ReferenceNo = i.id
    WHERE i.id = ?
  `;

  db.query(sql, [invoiceId], (err, rows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json(err);
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // ✅ Always returns one row if invoice exists
    res.json(rows[0]);
  });
});

// router.get("/:id", (req, res) => {
//    const invoiceId = Number(req.params.id);

//    if (!invoiceId) {
//      return res.status(400).json({ message: "Invalid invoice ID" });
//    }

//   const sql = `
//     SELECT *
//      FROM invoices
//      WHERE id = ?
//      LIMIT 1
//    `;

//   db.query(sql, [invoiceId], (err, rows) => {
//     if (err) {
//       console.error("DB error:", err);
//       return res.status(500).json(err);
//      }

//      if (!rows || rows.length === 0) {
//        return res.status(404).json({ message: "Invoice not found" });
//      }

//      // You already return items separately in your project
//      res.json(rows[0]);
//    });
//  });

// router.get("/payment-progress", (req, res) => {
//   console.log("🟢 payment-progress route hit");

//   const invoiceId = Number(req.query.invoiceId);
//   console.log("InvoiceId:", invoiceId);

//   if (!invoiceId) {
//     return res.status(400).json({ message: "Invoice ID required" });
//   }

//   const sql = `
//     SELECT
//       i.id AS invoice_id,
//       i.grand_total,
//       IFNULL(SUM(r.TransactionAmount), 0) AS total_paid,
//       ROUND(
//         IFNULL(
//           (SUM(r.TransactionAmount) / NULLIF(i.grand_total, 0)) * 100,
//           0
//         ),
//         2
//       ) AS payment_percentage
//     FROM invoices i
//     LEFT JOIN receipts r
//       ON r.ReferenceNo = i.id
//     WHERE i.id = ?
//   `;

//   db.query(sql, [invoiceId], (err, rows) => {
//     if (err) {
//       console.error("DB error:", err);
//       return res.status(500).json(err);
//     }

//     if (!rows || rows.length === 0) {
//       return res.status(404).json({ message: "Invoice not found" });
//     }

//     // ✅ Always returns one row if invoice exists
//     res.json(rows[0]);
//   });
// });

/* =====================================================
   ✅ 2️⃣ GET INVOICE BY ID (DYNAMIC ROUTE — MUST BE LAST)
   ===================================================== */
// router.get("/:id", (req, res) => {
//   const invoiceId = Number(req.params.id);

//   if (!invoiceId) {
//     return res.status(400).json({ message: "Invalid invoice ID" });
//   }

//   const sql = `
//     SELECT *
//     FROM invoices
//     WHERE id = ?
//     LIMIT 1
//   `;

//   db.query(sql, [invoiceId], (err, rows) => {
//     if (err) {
//       console.error("DB error:", err);
//       return res.status(500).json(err);
//     }

//     if (!rows || rows.length === 0) {
//       return res.status(404).json({ message: "Invoice not found" });
//     }

//     // You already return items separately in your project
//     res.json(rows[0]);
//   });
// });


// ==================== SAVE invoice ====================

router.post("/", async (req, res) => {
  const {
    customer_name = null,
    ship_to = null,
    mobile = null,
    sales_person = null,
    invoice_date = null,
    due_date = null,
    billing_address = null,
    tds = 0,          // ✅ TDS AMOUNT
    tds_percent = 0,
    tcs = 0,          // ✅ TDS AMOUNT
    tcs_percent = 0,
    total_qty = 0,
    discount_total = 0,
    grand_total = 0,
    transport_name = null,
    dc_no = null,
    manual_invoice_no = null,
    place_of_delivery = null,
    terms = null,
    payment_type = "credit",  // NEW: cash or credit
    mode_of_payment = null,
    bank_account = null,
    staff_name = null,
    upi_id = null,          // NEW: UPI Id
    items = [],
    template_id,
    is_sku = 1,
    is_inclusive = 0,
    job_inward_id = null
  } = req.body;

  // Convert DD-MM-YYYY --> YYYY-MM-DD  (IMPORTANT FIX)
  function fromDMYtoYMD(date) {
    if (!date) return null;
    if (!date.includes("-")) return date;
    const segments = date.split("-");
    if (segments[0].length === 4) return date; // Already YYYY-MM-DD
    const [d, m, y] = segments;
    return `${y}-${m}-${d}`;
  }

  const yearId = req.headers['x-year-id'];
  const finalinvoiceDate = fromDMYtoYMD(invoice_date);
  const finalDueDate = fromDMYtoYMD(due_date);

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "No invoice items provided" });
  }

  // Validate items
  if (is_sku === 1) {
    for (const item of items) {
      if (!item.sku || item.sku.trim() === "") {
        return res.status(400).json({ error: "SKU missing for one of the items" });
      }
      if (
        item.qty === "" ||
        item.qty === undefined ||
        item.qty === null ||
        isNaN(Number(item.qty))
      ) {
        return res.status(400).json({ error: `Invalid qty for item` });
      }
    }
  }

  try {
    // Fetch template stock_action
    const templateResult = await new Promise((resolve, reject) => {
      db.query(
        "SELECT stock_action FROM templates WHERE id = ? LIMIT 1",
        [template_id],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });

    if (!templateResult.length) {
      return res.status(400).json({ error: "invoice template not found" });
    }

    const stock_action = templateResult[0].stock_action;

    // Pre-check stock
    if (is_sku === 1 && stock_action === "reduce") {
      for (const item of items) {
        const qty = Number(item.qty);
        const sku = item.sku.trim();

        const result = await new Promise((resolve, reject) => {
          db.query(
            "SELECT current_stock FROM products WHERE sku = ? LIMIT 1",
            [sku],
            (err, rows) => {
              if (err) return reject(err);
              resolve(rows);
            }
          );
        });

        if (!result.length) {
          return res.status(400).json({
            error: `SKU ${sku} not found in stock`,
          });
        }

        const available = Number(result[0].current_stock) || 0;

        if (qty > available) {
          return res.status(400).json({
            error: `Insufficient stock for SKU ${sku}. Available: ${available}, Required: ${qty}`,
          });
        }
      }
    }

    router.get("/products", (req, res) => {
      const term = req.query.term;
      db.query(
        "SELECT sku, product_name, mrp, gst, discount FROM products WHERE sku LIKE ? OR product_name LIKE ? LIMIT 10",
        [`%${term}%`, `%${term}%`],
        (err, results) => {
          if (err) return res.status(500).json({ error: err });
          res.json(results);
        }
      );
    });

    // Insert invoice
    let invoiceSql = "";
    let sqlValues = [];

    if (manual_invoice_no) {
      invoiceSql = `
        INSERT INTO invoices
        (id, customer_name, ship_to, mobile, sales_person, invoice_date, due_date, billing_address, total_qty, discount_total, gst_total, net_total, tds, tds_percent, tcs, tcs_percent, grand_total, transport_name, dc_no, manual_invoice_no, place_of_delivery, terms, payment_type, mode_of_payment, bank_account, staff_name, upi_id, is_inclusive, job_inward_id, year_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      sqlValues = [
        manual_invoice_no,
        customer_name,
        ship_to,
        mobile,
        sales_person,
        finalinvoiceDate,
        finalDueDate,
        billing_address,
        total_qty,
        discount_total,
        req.body.gst_total || 0,
        req.body.net_total || 0,
        tds,
        tds_percent,
        tcs,
        tcs_percent,
        grand_total,
        transport_name,
        dc_no,
        manual_invoice_no,
        place_of_delivery,
        terms,
        payment_type,
        mode_of_payment,
        bank_account,
        staff_name,
        upi_id,
        is_inclusive ?? 0,
        job_inward_id,
        yearId
      ];
    } else {
      invoiceSql = `
        INSERT INTO invoices
        (customer_name, ship_to, mobile, sales_person, invoice_date, due_date, billing_address, total_qty, discount_total, gst_total, net_total, tds, tds_percent, tcs, tcs_percent, grand_total, transport_name, dc_no, manual_invoice_no, place_of_delivery, terms, payment_type, mode_of_payment, bank_account, staff_name, upi_id, is_inclusive, job_inward_id, year_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      sqlValues = [
        customer_name,
        ship_to,
        mobile,
        sales_person,
        finalinvoiceDate,
        finalDueDate,
        billing_address,
        total_qty,
        discount_total,
        req.body.gst_total || 0,
        req.body.net_total || 0,
        tds,
        tds_percent,
        tcs,
        tcs_percent,
        grand_total,
        transport_name,
        dc_no,
        manual_invoice_no,
        place_of_delivery,
        terms,
        payment_type,
        mode_of_payment,
        bank_account,
        staff_name,
        upi_id,
        is_inclusive ?? 0,
        job_inward_id,
        yearId
      ];
    }

    const invoiceResult = await new Promise((resolve, reject) => {
      db.query(
        invoiceSql,
        sqlValues,
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    const invoice_id = manual_invoice_no || invoiceResult.insertId;

    // Insert items
    const itemSql = `
      INSERT INTO invoice_items
      (invoice_id, sku, qty, rate, disc_val, disc_percent, gst_percent, total)
      VALUES ?
    `;

    const values = items.map((item) => [
      invoice_id,
      item.sku || "",
      Number(item.qty) || 0,
      item.rate || 0,
      item.disc_val || 0,
      item.disc_percent || 0,
      item.gst_percent || 0,

      item.total || 0,
    ]);

    await new Promise((resolve, reject) => {
      db.query(itemSql, [values], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Stock update
    if (stock_action === "add" || stock_action === "reduce") {
      for (const item of items) {
        const qty = Number(item.qty);
        const sku = item.sku.trim();

        if (qty <= 0) continue;

        try {
          const result = await new Promise((resolve, reject) => {
            db.query(
              "SELECT current_stock FROM products WHERE sku = ? LIMIT 1",
              [sku],
              (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
              }
            );
          });

          if (!result.length) continue;

          const currentStock = Number(result[0].current_stock) || 0;
          let newStock = currentStock;

          if (stock_action === "add") newStock = currentStock + qty;
          if (stock_action === "reduce") newStock = currentStock - qty;

          await new Promise((resolve, reject) => {
            db.query(
              "UPDATE products SET current_stock = ? WHERE sku = ?",
              [newStock, sku],
              (err) => {
                if (err) return reject(err);
                resolve();
              }
            );
          });
        } catch (error) {
          console.error("💥 Error updating stock:", error);
        }
      }
    }

    res.json({ success: true, message: "invoice saved successfully!" });
  } catch (err) {
    console.error("❌ Error saving invoice:", err);
    console.error("📥 REQUEST BODY RECEIVED:", JSON.stringify(req.body, null, 2));

    return res.status(500).json({
      error: "Internal server error",
      debug: err.message || err,
    });
  }
});

// router.get("/:id", (req, res) => {
//   const { id } = req.params;

//   db.query("SELECT * FROM invoices WHERE id = ?", [id], (err, rows) => {
//     if (err) {
//       console.error("SQL Error:", err);

//       return res.status(500).json({
//         error: "Internal server error",
//         debug: err.sqlMessage || err.message || err,
//       });
//     }

//     if (rows.length === 0) {
//       return res.status(404).json({ message: "Data not found" });
//     }

//     res.json(rows[0]);
//   });
// });

// DEBUG: Log incoming request


// Wrap db.query to catch SQL errors with query + values

//     SELECT 
//       id, customer_name, ship_to, mobile, sales_person,invoice_date,
// due_date, billing_address, total_qty, discount_total, 
//       grand_total
//     FROM invoices 
//     WHERE id = ?
// --- Get invoice by ID (for Edit) ---
// router.get("/:id", (req, res) => {
//   const { id } = req.params;

//   const sql = `

// SELECT 
//     invoices.id,
//     invoices.customer_name,
//     invoices.sales_person,
//     invoices.invoice_date,
//     invoices.mobile,
//     invoices.due_date,
//     invoices.discount_total,
//     invoices.gst_total,
//     invoices.net_total,
//     invoices.grand_total,
//     invoices.created_at,
//     invoices.round_off,
//     invoices.igst,
//     invoices.ship_to,
//     invoices.billing_address,
//     invoices.total_qty,
//     invoice_items.sku,
//     invoice_items.qty,
//     invoice_items.rate,
//     invoice_items.disc_val,
//     invoice_items.disc_percent,
//     invoice_items.gst_percent,
//     invoice_items.total
// FROM invoices
// LEFT JOIN invoice_items
//     ON invoices.id = invoice_items.invoice_id
// WHERE invoices.id = ?;

//   `;

//   db.query(sql, [id], (err, invoiceResult) => {
//     if (err) return res.status(500).json({ error: err });

//     if (invoiceResult.length === 0)
//       return res.status(404).json({ message: "Invoice not found" });

//     const itemsSql = `SELECT * FROM invoice_items WHERE invoice_id = ?`;

//     db.query(itemsSql, [id], (err, itemsResult) => {
//       if (err) return res.status(500).json({ error: err });

//       res.json({
//         invoice: invoiceResult[0],
//         items: itemsResult,
//       });
//     });
//   });
// });


router.get("/:id", (req, res) => {
  function formatDateDMY(date) {
    if (!date) return null;
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const id = req.params.id;

  const sql = `
    SELECT 
      invoices.id,
      invoices.customer_name,
      invoices.invoice_date,
      invoices.due_date,
      invoices.sales_person,
      invoices.mobile,
       invoices.tds_percent,
       invoices.tcs,
          invoices.tcs_percent,
       invoices.tds,
      invoices.total_qty,
      invoices.discount_total,
    
 
      invoices.grand_total,
      invoices.gst_total,
      invoices.net_total,
      invoices.transport_name,
      invoices.dc_no,
      invoices.manual_invoice_no,
      invoices.place_of_delivery,
      invoices.terms,
      invoices.payment_type,
      invoices.mode_of_payment,
      invoices.bank_account,
      invoices.staff_name,
      invoices.upi_id,
      invoices.created_at,
     
   
      invoices.billing_address,
      invoices.ship_to,

      invoice_items.sku,
      invoice_items.qty,
      invoice_items.rate,
      invoice_items.disc_val,
      invoice_items.disc_percent,
      invoice_items.gst_percent,
      invoice_items.total AS item_total

    FROM invoices
    LEFT JOIN invoice_items
      ON invoices.id = invoice_items.invoice_id
    WHERE invoices.id = ?
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    if (rows.length === 0)
      return res.json({ message: "invoice not found" });

    // HEADER
    const header = {
      id: rows[0].id,
      customer_name: rows[0].customer_name,
      invoice_date: formatDateDMY(rows[0].invoice_date),
      due_date: formatDateDMY(rows[0].due_date),
      mobile: rows[0].mobile,
      sales_person: rows[0].sales_person,
      total_qty: rows[0].total_qty,
      discount_total: rows[0].discount_total,

      tds: rows[0].tds,
      tds_percent: rows[0].tds_percent,
      tcs: rows[0].tcs,
      tcs_percent: rows[0].tcs_percent,
      grand_total: rows[0].grand_total,
      transport_name: rows[0].transport_name,
      dc_no: rows[0].dc_no,
      manual_invoice_no: rows[0].manual_invoice_no,
      place_of_delivery: rows[0].place_of_delivery,
      terms: rows[0].terms,
      payment_type: rows[0].payment_type || "credit",
      mode_of_payment: rows[0].mode_of_payment || "",
      bank_account: rows[0].bank_account || "",
      staff_name: rows[0].staff_name || "",
      upi_id: rows[0].upi_id || "",
      created_at: rows[0].created_at,

      igst: rows[0].igst,
      ship_to: rows[0].ship_to,
      billing_address: rows[0].billing_address,
      items: []
    };

    // ITEMS
    rows.forEach((row) => {
      if (row.sku) {
        header.items.push({
          sku: row.sku,
          qty: row.qty,
          rate: row.rate,
          disc_val: row.disc_val,
          disc_percent: row.disc_percent,
          gst_percent: row.gst_percent,

          total: row.item_total
        });
      }
    });

    res.json(header);
  });
});

// ==================== UPDATE invoice ====================


router.put("/invoice/:id", (req, res) => {
  const { id } = req.params;
  const invoice = req.body;

  const totalQty = invoice.items.reduce((sum, row) => sum + Number(row.qty || 0), 0);

  const sql = `
    UPDATE invoice s
    SET customer_id=?, invoice_date=?, total_qty=?, total_amount=? 
    WHERE id=?
  `;

  const data = [
    invoice.customer_id,
    invoice.invoice_date,
    totalQty,
    invoice.total_amount,
    id
  ];

  db.query(sql, data, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "invoice updated successfully!", totalQty });
  });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    customer_name,
    ship_to,
    mobile,
    invoice_date,
    due_date,
    sales_person,
    billing_address,
    total_qty,
    tds_percent,
    tcs,
    tcs_percent,
    tds,
    discount_total,
    grand_total,
    transport_name,
    dc_no,
    manual_invoice_no,
    place_of_delivery,
    terms,
    payment_type = "credit",
    mode_of_payment = null,
    bank_account = null,
    staff_name = null,
    upi_id = null,
    items,
    template_id,
    is_sku = 1,
    is_inclusive = 0,
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "No invoice items provided" });
  }

  try {
    // Fetch template stock_action
    const templateResult = await new Promise((resolve, reject) => {
      db.query(
        "SELECT stock_action FROM templates WHERE id = ? LIMIT 1",
        [template_id],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });

    if (!templateResult || !templateResult.length) {
      return res.status(400).json({ error: "invoice template not found" });
    }

    const stock_action = templateResult[0].stock_action;

    // Fetch old items
    const oldItems = await new Promise((resolve, reject) => {
      db.query(
        "SELECT sku, qty FROM invoice_items WHERE invoice_id = ?",
        [id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results || []);
        }
      );
    });

    // Pre-check stock
    if (is_sku === 1 && stock_action === "reduce") {
      for (const item of items) {
        const qty = Number(item.qty) || 0;
        const sku = (item.sku || "").trim();

        const result = await new Promise((resolve, reject) => {
          db.query(
            "SELECT current_stock FROM products WHERE sku = ? LIMIT 1",
            [sku],
            (err, rows) => {
              if (err) return reject(err);
              resolve(rows);
            }
          );
        });

        if (!result || !result.length) {
          return res
            .status(400)
            .json({ error: `SKU ${sku} not found in products` });
        }

        const oldQty = oldItems.find((x) => x.sku === sku)?.qty || 0;
        const available =
          Number(result[0].current_stock || 0) + Number(oldQty);

        if (qty > available) {
          return res.status(400).json({
            error: `Insufficient stock for SKU ${sku}. Available: ${available}, Required: ${qty}`,
          });
        }
      }
    }

    // ⭐⭐⭐ FIXED SQL QUERY ⭐⭐⭐
    const updateinvoiceSql = `
      UPDATE invoices SET
        customer_name = ?,
        ship_to = ?,
        mobile = ?,
        sales_person = ?,
        billing_address = ?,
        invoice_date = ?,  
        due_date = ?,       
        total_qty = ?,
        discount_total = ?,
        gst_total = ?,
        net_total = ?,
        tds_percent=?,
        tds=?,
        tcs_percent=?,
        tcs=?,
        grand_total = ?,
        transport_name = ?,
        dc_no = ?,
        manual_invoice_no = ?,
        place_of_delivery = ?,
        terms = ?,
        payment_type = ?,
        mode_of_payment = ?,
        bank_account = ?,
        staff_name = ?,
        upi_id = ?,
        is_inclusive = ?
      WHERE id = ?
    `;

    await new Promise((resolve, reject) => {
      db.query(
        updateinvoiceSql,
        [
          customer_name,
          ship_to,
          mobile,
          sales_person,
          billing_address,
          invoice_date,
          due_date,
          total_qty,
          discount_total,
          req.body.gst_total || 0,
          req.body.net_total || 0,
          tds_percent,
          tds,
          tcs_percent,
          tcs,
          grand_total,
          transport_name,
          dc_no,
          manual_invoice_no,
          place_of_delivery,
          terms,
          payment_type,
          mode_of_payment,
          bank_account,
          staff_name,
          upi_id,
          is_inclusive ?? 0,
          id,
        ],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    // Delete old items
    await new Promise((resolve, reject) => {
      db.query(
        "DELETE FROM invoice_items WHERE invoice_id = ?",
        [id],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    // Insert new items
    const values = items.map((item) => [
      id,
      item.sku || "",
      Number(item.qty) || 0,
      Number(item.rate) || 0,
      Number(item.disc_val) || 0,
      Number(item.disc_percent) || 0,
      Number(item.gst_percent) || 0,

      Number(item.total) || 0,
    ]);

    if (values.length) {
      const itemSql = `
        INSERT INTO invoice_items
        (invoice_id, sku, qty, rate, disc_val, disc_percent, gst_percent, total)
        VALUES ?
      `;

      await new Promise((resolve, reject) => {
        db.query(itemSql, [values], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }

    // Update stock
    if (is_sku === 1 && (stock_action === "add" || stock_action === "reduce")) {
      for (const item of items) {
        const sku = (item.sku || "").trim();
        const newQty = Number(item.qty) || 0;
        const oldQty = oldItems.find((x) => x.sku === sku)?.qty || 0;
        const diff = newQty - oldQty;

        if (diff === 0) continue;

        const result = await new Promise((resolve, reject) => {
          db.query(
            "SELECT current_stock FROM products WHERE sku = ? LIMIT 1",
            [sku],
            (err, rows) => {
              if (err) return reject(err);
              resolve(rows);
            }
          );
        });

        if (!result || !result.length) continue;

        const currentStock = Number(result[0].current_stock || 0);
        const newStock =
          stock_action === "add"
            ? currentStock + diff
            : currentStock - diff;

        await new Promise((resolve, reject) => {
          db.query(
            "UPDATE products SET current_stock = ? WHERE sku = ?",
            [newStock, sku],
            (err) => {
              if (err) return reject(err);
              resolve();
            }
          );
        });
      }
    }

    res.json({ success: true, message: "invoice updated successfully!" });
  } catch (err) {
    console.error("❌ Error updating invoice:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// router.get("/", (req, res) => {
//   try {
//     let {
//       page = 1,
//       limit = 20,
//       sort_by = "id",
//       order = "DESC",
//       customer_name,
//       mobile,
//       sales_person,
//       invoice_date,
//       due_date,
//       status,
//     } = req.query;

//     page = parseInt(page, 10) || 1;
//     limit = parseInt(limit, 10) || 20;
//     order = (order || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

//     const allowedSort = new Set([
//       "id",

//       "customer_name",
//       "invoice_date",
//       "total_qty",
//       "sales_person",
//     ]);
//     if (!allowedSort.has(sort_by)) sort_by = "id";

//     const offset = (page - 1) * limit;

//     const whereParts = [];
//     const params = [];

//     if (customer_name) {
//       whereParts.push("customer_name LIKE ?");
//       params.push(`%${customer_name}%`);
//     }
//     if (mobile) {
//       whereParts.push("mobile LIKE ?");
//       params.push(`%${mobile}%`);
//     }
//     if (sales_person) {
//       whereParts.push("sales_person LIKE ?");
//       params.push(`%${sales_person}%`);
//     }
//     if (invoice_date) {
//       // Expecting YYYY-MM-DD from frontend date input
//       whereParts.push("invoice_date = ?");
//       params.push(invoice_date);
//     }
//     if (due_date) {
//       whereParts.push("due_date = ?");
//       params.push(due_date);
//     }
//     if (status) {
//       // Accept only Paid / Pending
//       if (["Paid", "Pending"].includes(status)) {
//         whereParts.push("status = ?");
//         params.push(status);
//       }
//     }

//     const whereClause = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

//     const sql = `
//       SELECT
//         id,
//         customer_name,

//         DATE_FORMAT(invoice_date, '%d-%m-%Y') AS invoice_date,
//         total_qty,
//         sales_person,
//         grand_total,
//         mobile,
//         status
//       FROM invoices
//       ${whereClause}
//       ORDER BY ${sort_by} ${order}
//       LIMIT ? OFFSET ?
//     `;

//     // params then limit and offset
//     const queryParams = [...params, limit, offset];

//     db.query(sql, queryParams, (err, rows) => {
//       if (err) {
//         console.error("invoice list error:", err);
//         return res.status(500).json({ error: "DB error", debug: err.message });
//       }

//       // total count
//       const countSql = `SELECT COUNT(*) AS total FROM invoices ${whereClause}`;
//       db.query(countSql, params, (err2, countRows) => {
//         if (err2) {
//           console.error("invoice count error:", err2);
//           return res.status(500).json({ error: "DB error", debug: err2.message });
//         }

//         const total = countRows[0]?.total || 0;
//         const pages = Math.ceil(total / limit) || 1;

//         res.json({
//           data: rows,
//           // pagination: {
//           //   page,
//           //   limit,
//           //   total,
//           //   pages,
//           // },
//         });
//       });
//     });
//   } catch (e) {
//     console.error("Unexpected error in GET /invoice:", e);
//     res.status(500).json({ error: "Unexpected server error" });
//   }
// });

/**
 * DELETE /invoice/:id
 * 
 * 
 */

function queryPromise(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}


router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Fetch all invoice items
    const items = await queryPromise(
      "SELECT sku, qty FROM invoice_items WHERE invoice_id = ?",
      [id]
    );

    // 2️⃣ Restore stock for each SKU
    for (const item of items) {
      const { sku, qty } = item;

      // Get current stock
      const prod = await queryPromise(
        "SELECT current_stock FROM products WHERE sku = ? LIMIT 1",
        [sku]
      );

      if (prod.length) {
        const newStock = Number(prod[0].current_stock) + Number(qty);

        await queryPromise(
          "UPDATE products SET current_stock = ? WHERE sku = ?",
          [newStock, sku]
        );
      }
    }

    // 3️⃣ Delete invoice items
    await queryPromise("DELETE FROM invoice_items WHERE invoice_id = ?", [id]);

    // 4️⃣ Delete invoice
    await queryPromise("DELETE FROM invoices WHERE id = ?", [id]);

    res.json({ success: true, message: "invoice deleted & stock restored." });
  } catch (err) {
    console.error("DELETE /invoices/:id error:", err);
    res.status(500).json({ error: "DB error", debug: err.message });
  }
});

// router.get("/payment-progress", (req, res) => {
//   const { invoiceId } = req.query; // ✅ FIXED

//   const sql = `
//     SELECT
//       i.id AS invoice_id,
//       i.grand_total,
//       COALESCE(SUM(r.TransactionAmount), 0) AS total_paid,
//       ROUND(
//         (COALESCE(SUM(r.TransactionAmount), 0) / i.grand_total) * 100,
//         2
//       ) AS payment_percentage
//     FROM invoices i
//     LEFT JOIN receipts r
//       ON r.ReferenceNo = i.id
//     WHERE i.id = ?
//     GROUP BY i.id
//   `;

//   db.query(sql, [invoiceId], (err, results) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: err.message });
//     }

//     if (results.length === 0) {
//       return res.json({
//         invoice_id: invoiceId,
//         grand_total: 0,
//         total_paid: 0,
//         payment_percentage: 0,
//       });
//     }

//     res.json(results[0]);
//   });
// });

router.get("/", (req, res) => {
  try {
    let {
      page = 1,
      limit = 20,
      sort_by = "id",
      order = "DESC",
      customer_name,
      mobile,
      sales_person,
      invoice_date,
      due_date,
      status,
      usertype_id
    } = req.query;

    if (!usertype_id) {
      return res.status(400).json({ message: "User type missing" });
    }

    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 20;
    order = (order || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

    const allowedSort = new Set([
      "id",
      "customer_name",
      "invoice_date",
      "total_qty",
      "sales_person",
      "grand_total",
      "status"
    ]);
    if (!allowedSort.has(sort_by)) sort_by = "id";

    const offset = (page - 1) * limit;

    // Build WHERE clause
    const yearId = req.headers['x-year-id'];
    const whereParts = ["year_id = ?"];
    const params = [yearId];

    if (customer_name) {
      whereParts.push("customer_name LIKE ?");
      params.push(`%${customer_name}%`);
    }
    if (mobile) {
      whereParts.push("mobile LIKE ?");
      params.push(`%${mobile}%`);
    }
    if (sales_person) {
      whereParts.push("sales_person LIKE ?");
      params.push(`%${sales_person}%`);
    }
    if (invoice_date) {
      whereParts.push("invoice_date = ?");
      params.push(invoice_date);
    }
    if (due_date) {
      whereParts.push("due_date = ?");
      params.push(due_date);
    }
    if (status && ["Paid", "Pending"].includes(status)) {
      whereParts.push("status = ?");
      params.push(status);
    }

    const whereClause = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    // 1️⃣ Fetch privileges first
    const privQ = `
      SELECT 
        p.can_add,  
        p.can_update,
        p.can_delete,
        p.can_view,
        p.can_print
      FROM privileges p
      JOIN modules m ON m.id = p.module_id
      WHERE p.usertype_id = ?
        AND m.module_name = 'Invoice'
      LIMIT 1
    `;

    db.query(privQ, [usertype_id], (err, privRows) => {
      if (err) {
        console.error("Privilege Error:", err);
        return res.status(500).json({ message: "Privilege DB Error" });
      }

      if (!privRows.length || privRows[0].can_view !== 1) {
        return res.status(403).json({ message: "Access Denied" });
      }

      const invoicePriv = {
        can_add: Number(privRows[0].can_add),
        can_update: Number(privRows[0].can_update),
        can_delete: Number(privRows[0].can_delete),
        can_view: Number(privRows[0].can_view),
        can_print: Number(privRows[0].can_print),
      };

      // 2️⃣ Fetch invoices with filters, sorting, pagination
      const invoiceSql = `
        SELECT
          id,
          customer_name,
          DATE_FORMAT(invoice_date, '%d-%m-%Y') AS invoice_date,
          total_qty,
          sales_person,
          grand_total,
          mobile,
          status
        FROM invoices
        ${whereClause}
        ORDER BY ${sort_by} ${order}
        LIMIT ? OFFSET ?
      `;
      const queryParams = [...params, limit, offset];

      db.query(invoiceSql, queryParams, (err2, invoices) => {
        if (err2) {
          console.error("Invoice Error:", err2);
          return res.status(500).json({ message: "Invoice DB Error" });
        }

        // total count for pagination
        const countSql = `SELECT COUNT(*) AS total FROM invoices ${whereClause}`;
        db.query(countSql, params, (err3, countRows) => {
          if (err3) {
            console.error("Invoice count error:", err3);
            return res.status(500).json({ message: "Invoice DB Error" });
          }

          const total = countRows[0]?.total || 0;
          const pages = Math.ceil(total / limit) || 1;

          // ✅ Send invoices + privileges + pagination
          res.json({
            data: invoices,
            privileges: invoicePriv,
            pagination: {
              page,
              limit,
              total,
              pages
            }
          });
        });
      });
    });
  } catch (e) {
    console.error("Unexpected error in GET /invoice:", e);
    res.status(500).json({ error: "Unexpected server error" });
  }
});

router.get("/by-customer/:customerName", (req, res) => {
  const { customerName } = req.params;

  // Use .promise() so db.query returns a Promise
  db.promise()
    .query(
      `SELECT DISTINCT id
       FROM invoices
       WHERE LOWER(customer_name) = LOWER(?)`,
      [customerName]
    )
    .then(([rows]) => {
      res.json(rows);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});




export default router;
