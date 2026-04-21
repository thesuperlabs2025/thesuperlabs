import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";

const router = express.Router();

router.get("/next-credit-note-no", async (req, res) => {
  const yearId = req.headers['x-year-id'];
  try {
    const [rows] = await db.promise().query(
      `
        SELECT id
        FROM credit_note
        WHERE year_id = ?
        ORDER BY id DESC
        LIMIT 1
        `,
      [yearId]
    );

    const nextNo = rows.length > 0 ? rows[0].id + 1 : 1;
    res.json({ creditNoteNo: nextNo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ CREDIT NOTE LIST (MUST BE FIRST)
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
//       credit_note_date,
//       due_date,
//       status,
//     } = req.query;

//     page = parseInt(page, 10) || 1;
//     limit = parseInt(limit, 10) || 20;
//     order = order === "ASC" ? "ASC" : "DESC";

//     const allowedSort = [
//       "id",
//       "customer_name",
//       "credit_note_date",
//       "total_qty",
//       "sales_person",
//       "grand_total",
//     ];
//     if (!allowedSort.includes(sort_by)) sort_by = "id";

//     const offset = (page - 1) * limit;

//     const where = [];
//     const params = [];

//     if (customer_name) {
//       where.push("customer_name LIKE ?");
//       params.push(`%${customer_name}%`);
//     }
//     if (mobile) {
//       where.push("mobile LIKE ?");
//       params.push(`%${mobile}%`);
//     }
//     if (sales_person) {
//       where.push("sales_person LIKE ?");
//       params.push(`%${sales_person}%`);
//     }
//     if (credit_note_date) {
//       where.push("credit_note_date = ?");
//       params.push(credit_note_date);
//     }
//     if (due_date) {
//       where.push("due_date = ?");
//       params.push(due_date);
//     }
//     if (status) {
//       where.push("status = ?");
//       params.push(status);
//     }

//     const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

//     const sql = `
//       SELECT
//         id,
//         customer_name,
//         DATE_FORMAT(credit_note_date,'%d-%m-%Y') AS credit_note_date,
//         total_qty,
//         sales_person,
//         grand_total,
//         mobile,
//         status
//       FROM credit_note
//       ${whereSql}
//       ORDER BY ${sort_by} ${order}
//       LIMIT ? OFFSET ?
//     `;

//     db.query(sql, [...params, limit, offset], (err, rows) => {
//       if (err) return res.status(500).json(err);

//       db.query(
//         `SELECT COUNT(*) AS total FROM credit_note ${whereSql}`,
//         params,
//         (err2, count) => {
//           if (err2) return res.status(500).json(err2);

//           res.json({
//             data: rows,
//             pagination: {
//               page,
//               limit,
//               total: count[0].total,
//               pages: Math.ceil(count[0].total / limit),
//             },
//           });
//         }
//       );
//     });
//   } catch (e) {
//     res.status(500).json({ error: "Server error" });
//   }
// });


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

// /* =====================================================
//    ✅ 2️⃣ GET INVOICE BY ID (DYNAMIC ROUTE — MUST BE LAST)
//    ===================================================== */
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


// ==================== SAVE INVOICE ====================
router.post("/", async (req, res) => {
  const {
    customer_name = null,
    ship_to = null,
    mobile = null,
    sales_person = null,
    credit_note_date = null,
    due_date = null,
    billing_address = null,
    total_qty = 0,
    discount_total = 0,
    grand_total = 0,
    items = [],
    template_id,
    is_sku = 1
  } = req.body;

  // Convert DD-MM-YYYY --> YYYY-MM-DD  (IMPORTANT FIX)
  function fromDMYtoYMD(date) {
    if (!date) return null;
    if (!date.includes("-")) return null;
    const [d, m, y] = date.split("-");
    return `${y}-${m}-${d}`;
  }

  const finalcredit_noteDate = fromDMYtoYMD(credit_note_date);
  const finalDueDate = fromDMYtoYMD(due_date);

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "No credit note items provided" });
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
        return res.status(400).json({ error: `Invalid qty for sku ${item.sku}` });
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
      return res.status(400).json({ error: "Credit note template not found" });
    }

    const stock_action = templateResult[0].stock_action;

    // Pre-check stock
    if (stock_action === "reduce") {
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

    const yearId = req.headers['x-year-id'];
    // Insert creditnote
    const creditnoteSql = `
      INSERT INTO credit_note
      (customer_name, ship_to, mobile, sales_person, credit_note_date, due_date, billing_address, total_qty, discount_total, grand_total, year_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const creditnoteResult = await new Promise((resolve, reject) => {
      db.query(
        creditnoteSql,
        [
          customer_name,
          ship_to,
          mobile,
          sales_person,
          finalcredit_noteDate,   // <-- FIXED
          finalDueDate,       // <-- FIXED
          billing_address,
          total_qty,
          discount_total,
          grand_total,
          yearId
        ],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    const creditnote_id = creditnoteResult.insertId;

    // Insert items
    const itemSql = `
      INSERT INTO credit_note_items
      (credit_note_id, sku, qty, rate, disc_val, disc_percent, gst_percent, total)
      VALUES ?
    `;

    const values = items.map((item) => [
      creditnote_id,
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
    if (is_sku === 1 && (stock_action === "add" || stock_action === "reduce")) {
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

    res.json({ success: true, message: "Credit note saved successfully!" });
  } catch (err) {
    console.error("❌ Error saving credit note:", err);
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
      credit_note.id,
      credit_note.customer_name,
      credit_note.sales_person,
      credit_note.credit_note_date,
      credit_note.mobile,
      credit_note.due_date,
      credit_note.discount_total,
       credit_note.gst_total,
      credit_note.net_total,
      credit_note.grand_total,
      credit_note.created_at,
      credit_note.round_off,
      credit_note.igst,
      credit_note.ship_to,
     credit_note.billing_address,
      credit_note.total_qty,

      credit_note_items.sku,
      credit_note_items.qty,
      credit_note_items.rate,
      credit_note_items.disc_val,
      credit_note_items.disc_percent,
      credit_note_items.gst_percent,
      credit_note_items.total AS item_total

    FROM credit_note
    LEFT JOIN credit_note_items
      ON credit_note.id = credit_note_items.credit_note_id
    WHERE credit_note.id = ?
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    if (rows.length === 0)
      return res.json({ message: "credit note not found" });

    // HEADER
    const header = {
      id: rows[0].id,
      customer_name: rows[0].customer_name,
      sales_person: rows[0].sales_person,
      credit_note_date: formatDateDMY(rows[0].credit_note_date),
      mobile: rows[0].mobile,
      due_date: formatDateDMY(rows[0].due_date),
      discount_total: rows[0].discount_total,
      gst_total: rows[0].gst_total,
      net_total: rows[0].net_total,
      grand_total: rows[0].grand_total,
      created_at: rows[0].created_at,
      round_off: rows[0].round_off,
      igst: rows[0].igst,
      ship_to: rows[0].ship_to,
      billing_address: rows[0].billing_address,
      total_qty: rows[0].total_qty,
      items: []
    };


    // ITEMS (push only if exists)
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
// ==================== UPDATE INVOICE ====================


router.put("/creditnote/:id", (req, res) => {
  const { id } = req.params;
  const creditnote = req.body;

  const totalQty = creditnote.items.reduce((sum, row) => sum + Number(row.qty || 0), 0);

  const sql = `
    UPDATE credit_note
    SET customer_id=?, credit_note_date=?, total_qty=?, total_amount=? 
    WHERE id=?
  `;

  const data = [
    creditnote.customer_id,
    creditnote.credit_note_date,
    totalQty,
    creditnote.total_amount,
    id
  ];

  db.query(sql, data, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Credit note updated successfully!", totalQty });
  });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    customer_name,
    ship_to,
    mobile,
    credit_note_date,
    due_date,
    sales_person,
    billing_address,
    total_qty,
    discount_total,
    grand_total,
    items,
    template_id,
    is_sku = 1
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "No Credit note items provided" });
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
      return res.status(400).json({ error: "credit note template not found" });
    }

    const stock_action = templateResult[0].stock_action;

    // Fetch old items
    const oldItems = await new Promise((resolve, reject) => {
      db.query(
        "SELECT sku, qty FROM credit_note_items WHERE credit_note_id = ?",
        [id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results || []);
        }
      );
    });

    // Pre-check stock
    if (stock_action === "reduce") {
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
    const updatecredit_noteSql = `
      UPDATE credit_note SET
        customer_name = ?,
        ship_to = ?,
        mobile = ?,
        sales_person = ?,
        billing_address = ?,
        credit_note_date = ?,  
        due_date = ?,       
        total_qty = ?,
        discount_total = ?,
        grand_total = ?
      WHERE id = ?
    `;

    await new Promise((resolve, reject) => {
      db.query(
        updatecredit_noteSql,
        [
          customer_name,
          ship_to,
          mobile,
          sales_person,
          billing_address,
          credit_note_date,
          due_date,
          total_qty,
          discount_total,
          grand_total,
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
        "DELETE FROM credit_note_items WHERE credit_note_id = ?",
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
        INSERT INTO credit_note_items
        (credit_note_id, sku, qty, rate, disc_val, disc_percent, gst_percent, total)
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

    res.json({ success: true, message: "credit note updated successfully!" });
  } catch (err) {
    console.error("❌ Error updating credit note:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
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
      credit_note_date,
      due_date,
      status,
      usertype_id, // ✅ added
    } = req.query;

    // ✅ same validation as Estimate / DC / GRN
    if (!usertype_id) {
      return res.status(400).json({ message: "User type missing" });
    }

    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 20;
    order = (order || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

    const allowedSort = new Set([
      "id",
      "customer_name",
      "credit_note_date",
      "total_qty",
      "sales_person",
      "grand_total",
      "status",
    ]);
    if (!allowedSort.has(sort_by)) sort_by = "id";

    const offset = (page - 1) * limit;

    // 🔹 WHERE clause (LOGIC UNCHANGED)
    const yearId = req.headers['x-year-id'];
    const where = ["year_id = ?"];
    const params = [yearId];

    if (customer_name) {
      where.push("customer_name LIKE ?");
      params.push(`%${customer_name}%`);
    }
    if (mobile) {
      where.push("mobile LIKE ?");
      params.push(`%${mobile}%`);
    }
    if (sales_person) {
      where.push("sales_person LIKE ?");
      params.push(`%${sales_person}%`);
    }
    if (credit_note_date) {
      where.push("credit_note_date = ?");
      params.push(credit_note_date);
    }
    if (due_date) {
      where.push("due_date = ?");
      params.push(due_date);
    }
    if (status) {
      where.push("status = ?");
      params.push(status);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // 1️⃣ Privilege fetch (SAME PATTERN AS ESTIMATE)
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
        AND m.module_name = 'CREDIT NOTE'
      LIMIT 1
    `;

    db.query(privQ, [usertype_id], (perr, privRows) => {
      if (perr) {
        console.error("Privilege Error:", perr);
        return res.status(500).json({ message: "Privilege DB Error" });
      }

      if (!privRows.length || privRows[0].can_view !== 1) {
        return res.status(403).json({ message: "Access Denied" });
      }

      const creditNotePriv = {
        can_add: Number(privRows[0].can_add),
        can_update: Number(privRows[0].can_update),
        can_delete: Number(privRows[0].can_delete),
        can_view: Number(privRows[0].can_view),
        can_print: Number(privRows[0].can_print),
      };

      // 2️⃣ Credit Note list (SQL SAME)
      const sql = `
        SELECT
          id,
          customer_name,
          DATE_FORMAT(credit_note_date,'%d-%m-%Y') AS credit_note_date,
          total_qty,
          sales_person,
          grand_total,
          mobile,
          status
        FROM credit_note
        ${whereSql}
        ORDER BY ${sort_by} ${order}
        LIMIT ? OFFSET ?
      `;

      db.query(sql, [...params, limit, offset], (err, rows) => {
        if (err) {
          console.error("Credit Note Error:", err);
          return res.status(500).json({ message: "Credit Note DB Error" });
        }

        // count (UNCHANGED)
        db.query(
          `SELECT COUNT(*) AS total FROM credit_note ${whereSql}`,
          params,
          (err2, count) => {
            if (err2) {
              console.error("Credit Note count error:", err2);
              return res.status(500).json({ message: "Credit Note DB Error" });
            }

            const total = count[0]?.total || 0;
            const pages = Math.ceil(total / limit) || 1;

            // ✅ FINAL RESPONSE (MATCHES ESTIMATE)
            res.json({
              data: rows,
              privileges: creditNotePriv,
              pagination: {
                page,
                limit,
                total,
                pages,
              },
            });
          }
        );
      });
    });
  } catch (e) {
    console.error("Unexpected error in GET /credit_note:", e);
    res.status(500).json({ error: "Unexpected server error" });
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
//       credit_note_date,
//       due_date,
//       status,
//     } = req.query;

//     page = parseInt(page, 10) || 1;
//     limit = parseInt(limit, 10) || 20;
//     order = (order || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

//     const allowedSort = new Set([
//       "id",

//       "customer_name",
//       "credit_note_date",
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
//     if (credit_note_date) {
//       // Expecting YYYY-MM-DD from frontend date input
//       whereParts.push("credit_note_date = ?");
//       params.push(credit_note_date);
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

//         DATE_FORMAT(credit_note_date, '%d-%m-%Y') AS credit_note_date,
//         total_qty,
//         sales_person,
//         grand_total,
//         mobile,
//         status
//       FROM credit_note
//       ${whereClause}
//       ORDER BY ${sort_by} ${order}
//       LIMIT ? OFFSET ?
//     `;

//     // params then limit and offset
//     const queryParams = [...params, limit, offset];

//     db.query(sql, queryParams, (err, rows) => {
//       if (err) {
//         console.error("credit note list error:", err);
//         return res.status(500).json({ error: "DB error", debug: err.message });
//       }

//       // total count
//       const countSql = `SELECT COUNT(*) AS total FROM credit_note ${whereClause}`;
//       db.query(countSql, params, (err2, countRows) => {
//         if (err2) {
//           console.error("credit note count error:", err2);
//           return res.status(500).json({ error: "DB error", debug: err2.message });
//         }

//         const total = countRows[0]?.total || 0;
//         const pages = Math.ceil(total / limit) || 1;

//         res.json({
//           data: rows,
//           pagination: {
//             page,
//             limit,
//             total,
//             pages,
//           },
//         });
//       });
//     });
//   } catch (e) {
//     console.error("Unexpected error in GET /credit note:", e);
//     res.status(500).json({ error: "Unexpected server error" });
//   }
// });

/**
 * DELETE /invoices/:id
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
      "SELECT sku, qty FROM credit_note_items WHERE credit_note_id = ?",
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
    await queryPromise("DELETE FROM credit_note_items WHERE credit_note_id = ?", [id]);

    // 4️⃣ Delete invoice
    await queryPromise("DELETE FROM credit_note WHERE id = ?", [id]);

    res.json({ success: true, message: "credit note deleted & stock restored." });
  } catch (err) {
    console.error("DELETE /credit_note/:id error:", err);
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




export default router;
