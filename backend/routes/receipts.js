import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";
const router = express.Router();

// Get next receipt number
router.get("/next-receipt-no", async (req, res) => {
  const yearId = req.headers['x-year-id'];
  try {
    const [rows] = await db
      .promise()
      .query(
        `
        SELECT id
        FROM receipts
        WHERE year_id = ?
        ORDER BY id DESC
        LIMIT 1
        `,
        [yearId]
      );

    const nextNo = rows.length > 0 ? rows[0].id + 1 : 1;

    res.json({ receiptNo: nextNo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// router.get("/", (req, res) => {
//   const sql = "SELECT * FROM receipts";
//   db.query(sql, (err, results) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(results);
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


      TransactionDate,

      usertype_id
    } = req.query;

    if (!usertype_id) {
      return res.status(400).json({ message: "User type missing" });
    }

    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 20;
    order = order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const allowedSort = new Set([
      "id",
      "customer_name",
      "TransactionDate",

      "TransactionAmount",

    ]);
    if (!allowedSort.has(sort_by)) sort_by = "id";

    const offset = (page - 1) * limit;

    const yearId = req.headers['x-year-id'];
    const whereParts = ["year_id = ?"];
    const params = [yearId];

    if (customer_name) {
      whereParts.push("customer_name LIKE ?");
      params.push(`%${customer_name}%`);
    }


    if (TransactionDate) {
      whereParts.push("TransactionDate = ?");
      params.push(TransactionDate);
    }


    const whereClause = whereParts.length
      ? `WHERE ${whereParts.join(" AND ")}`
      : "";

    /* ---------------- PRIVILEGES ---------------- */
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
        AND m.module_name = 'Receipt'
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

      const receiptPriv = {
        can_add: Number(privRows[0].can_add),
        can_update: Number(privRows[0].can_update),
        can_delete: Number(privRows[0].can_delete),
        can_view: Number(privRows[0].can_view),
        can_print: Number(privRows[0].can_print),
      };

      /* ---------------- RECEIPTS ---------------- */
      const receiptSql = `
  SELECT
    id,
    customer_name,
    DATE_FORMAT(TransactionDate, '%d-%m-%Y') AS TransactionDate,
    TransactionAmount
  FROM receipts
  ${whereClause}
  ORDER BY ${sort_by} ${order}
  LIMIT ? OFFSET ?
`;


      const queryParams = [...params, limit, offset];

      db.query(receiptSql, queryParams, (err2, receipts) => {
        if (err2) {
          console.error("Receipt Error:", err2);
          return res.status(500).json({ message: "Receipt DB Error" });
        }

        /* ---------------- COUNT ---------------- */
        const countSql = `SELECT COUNT(*) AS total FROM receipts ${whereClause}`;
        db.query(countSql, params, (err3, countRows) => {
          if (err3) {
            console.error("Receipt count error:", err3);
            return res.status(500).json({ message: "Receipt DB Error" });
          }

          const total = countRows[0]?.total || 0;


          res.json({
            data: receipts,
            privileges: receiptPriv,

          });
        });
      });
    });
  } catch (e) {
    console.error("Unexpected error in GET /receipt:", e);
    res.status(500).json({ error: "Unexpected server error" });
  }
});


// ✅ GET single customer by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM receipts WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "receipts not found" });
    res.json(results[0]);
  });
});

// ✅ CREATE
router.post("/", (req, res) => {   // 👈 remove "/receipts" here
  const {
    customer_name,
    TransactionDate,
    ModeOfPayment,
    ReceiptRefNo,
    TransactionAmount,
    Details,
    PaymentAgainst,
    ReferenceNo,
    BankAccountName,
    AccountHead,
    StaffName,
  } = req.body;

  const yearId = req.headers['x-year-id'];
  const sql = `
    INSERT INTO receipts (
      customer_name, TransactionDate, ModeOfPayment, ReceiptRefNo,
      TransactionAmount, Details, PaymentAgainst, ReferenceNo,
      BankAccountName, AccountHead, StaffName, upi_id, year_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      customer_name,
      TransactionDate,
      ModeOfPayment,
      ReceiptRefNo,
      TransactionAmount,
      Details,
      PaymentAgainst,
      ReferenceNo,
      BankAccountName,
      AccountHead,
      StaffName,
      req.body.upi_id || null,
      yearId
    ],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Receipt saved successfully", id: result.insertId });
    }
  );
});

// ✅ UPDATE
router.put("/:id", (req, res) => {
  const {
    customer_name,
    TransactionDate,
    ModeOfPayment,
    ReceiptRefNo,
    TransactionAmount,
    Details,
    PaymentAgainst,
    ReferenceNo,
    BankAccountName,
    AccountHead,
    StaffName,
  } = req.body;

  const sql = `
    UPDATE receipts 
    SET customer_name=?, TransactionDate=?, ModeOfPayment=?, ReceiptRefNo=?, TransactionAmount=?, Details=?, PaymentAgainst=?, ReferenceNo=?, BankAccountName=?, AccountHead=?, StaffName=?, upi_id=? 
    WHERE id=?
  `;
  db.query(
    sql,
    [
      customer_name,
      TransactionDate,
      ModeOfPayment,
      ReceiptRefNo,
      TransactionAmount,
      Details,
      PaymentAgainst,
      ReferenceNo,
      BankAccountName,
      AccountHead,
      StaffName,
      req.body.upi_id || null,
      req.params.id,
    ],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: "Receipt updated successfully!" });
    }
  );
});

// ✅ DELETE
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM receipts WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Receipt deleted successfully!" });
  });
});


router.post("/save", async (req, res) => {
  const { receipt_no, receipt_date, customer_name, total_amount, invoices } = req.body;

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Insert receipt
    await conn.query(
      `INSERT INTO receipts
        (receipt_no, receipt_date, customer_name, amount)
       VALUES (?, ?, ?, ?)`,
      [receipt_no, receipt_date, customer_name, total_amount]
    );

    // 2️⃣ Update invoices
    for (const inv of invoices) {
      await conn.query(
        `UPDATE invoices
         SET
           paid_amount = paid_amount + ?,
           outstanding_amount = outstanding_amount - ?,
           status = CASE
             WHEN outstanding_amount - ? = 0 THEN 'PAID'
             ELSE 'PARTIAL'
           END
         WHERE invoice_no = ?`,
        [
          inv.paid_amount,
          inv.paid_amount,
          inv.paid_amount,
          inv.invoice_no
        ]
      );
    }

    await conn.commit();
    res.json({ success: true, message: "Receipt saved & invoices updated" });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: "Payment failed" });
  } finally {
    conn.release();
  }
});

router.get("/pending-invoices/:customer", (req, res) => {
  const { customer } = req.params;

  const sql = `
    SELECT 
      i.id AS invoice_no,
      (i.grand_total - COALESCE(SUM(r.TransactionAmount), 0)) AS outstanding_amount,
      i.status
    FROM invoices i
    LEFT JOIN receipts r 
      ON r.ReferenceNo = i.id 
      AND r.PaymentAgainst = 'Invoice'
    WHERE i.customer_name = ? AND i.year_id = ?
    GROUP BY i.id, i.grand_total, i.status
    HAVING outstanding_amount > 0
    ORDER BY i.id ASC
  `;

  db.query(sql, [customer, req.headers['x-year-id']], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json(err);
    }
    res.json(results);
  });
});


router.get("/api/outstanding/:customer", (req, res) => {
  res.setHeader("Cache-Control", "no-store"); // disable caching
  res.setHeader("Pragma", "no-cache");

  const { customer } = req.params;

  const sql = `
    SELECT 
      i.id AS invoice_no,
      i.customer_name,
      i.grand_total,
      COALESCE(i.grand_total - SUM(r.TransactionAmount), i.grand_total) AS outstanding_amount,
      i.status,
      i.invoice_date
    FROM invoices i
    LEFT JOIN receipts r
      ON r.PaymentAgainst = 'Invoice'
      AND r.ReferenceNo = i.id
      AND LOWER(r.customer_name) = LOWER(i.customer_name)
    WHERE LOWER(i.customer_name) = LOWER(?) AND i.year_id = ?
    GROUP BY i.id, i.customer_name, i.grand_total, i.status, i.invoice_date
    HAVING outstanding_amount > 0
    ORDER BY i.invoice_date ASC
  `;

  db.query(sql, [customer, req.headers['x-year-id']], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


router.post("/bulk", (req, res) => {
  const receipts = req.body;

  if (!Array.isArray(receipts) || receipts.length === 0) {
    return res.status(400).json({ message: "Invalid data" });
  }

  const sql = `
    INSERT INTO receipts
    (
      customer_name,
      TransactionDate,
      ModeOfPayment,
      ReceiptRefNo,
      PaymentAgainst,
      ReferenceNo,
      TransactionAmount,
      BankAccountName,
      AccountHead,
      Staffname,
      Details,
      upi_id,
      year_id
    )
    VALUES ?
  `;

  const yearId = req.headers['x-year-id'];
  const values = receipts.map(r => [
    r.customer_name,
    r.TransactionDate,
    r.ModeOfPayment,
    r.ReceiptRefNo,
    r.PaymentAgainst,
    r.ReferenceNo,
    r.TransactionAmount,
    r.BankAccountName,
    r.AccountHead,
    r.Staffname,
    r.Details,
    r.upi_id || null,
    yearId
  ]);

  db.query(sql, [values], (err) => {
    if (err) {
      console.error("Bulk insert error:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "Receipts saved successfully" });
  });
});


export default router;
