import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || "";

const router = express.Router();

// Get next voucher number
router.get("/next-voucher-no", async (req, res) => {
  const yearId = req.headers['x-year-id'];
  try {
    const [rows] = await db
      .promise()
      .query(
        `
        SELECT id
        FROM vouchers
        WHERE year_id = ?
        ORDER BY id DESC
        LIMIT 1
        `,
        [yearId]
      );

    const nextNo = rows.length > 0 ? rows[0].id + 1 : 1;

    res.json({ voucherNo: nextNo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ===================== GET ALL VOUCHERS =====================
// router.get("/", (req, res) => {
//   db.query("SELECT * FROM vouchers ORDER BY id DESC", (err, result) => {
//     if (err) return res.status(500).json({ error: err });
//     res.json(result);
//   });
// });
router.get("/", (req, res) => {
  try {
    let {
      page = 1,
      limit = 20,
      sort_by = "id",
      order = "DESC",
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

      "VoucherDate",
      "amount"
    ]);
    if (!allowedSort.has(sort_by)) sort_by = "id";

    const offset = (page - 1) * limit;

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
        AND m.module_name = 'Voucher'
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

      const voucherPriv = {
        can_add: Number(privRows[0].can_add),
        can_update: Number(privRows[0].can_update),
        can_delete: Number(privRows[0].can_delete),
        can_view: Number(privRows[0].can_view),
        can_print: Number(privRows[0].can_print),
      };

      /* ---------------- VOUCHERS ---------------- */
      const yearId = req.headers['x-year-id'];
      const voucherSql = `
        SELECT *
        FROM vouchers
        WHERE year_id = ?
        ORDER BY ${sort_by} ${order}
        LIMIT ? OFFSET ?
      `;

      db.query(voucherSql, [yearId, limit, offset], (err2, vouchers) => {
        if (err2) {
          console.error("Voucher Error:", err2);
          return res.status(500).json({ message: "Voucher DB Error" });
        }

        /* ---------------- COUNT ---------------- */
        const yearId = req.headers['x-year-id'];
        db.query(`SELECT COUNT(*) AS total FROM vouchers WHERE year_id = ?`, [yearId], (err3, countRows) => {
          if (err3) {
            console.error("Voucher count error:", err3);
            return res.status(500).json({ message: "Voucher DB Error" });
          }

          res.json({
            data: vouchers,
            privileges: voucherPriv,
            total: countRows[0]?.total || 0
          });
        });
      });
    });
  } catch (e) {
    console.error("Unexpected error in GET /voucher:", e);
    res.status(500).json({ error: "Unexpected server error" });
  }
});


// ===================== GET SINGLE VOUCHER =====================
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM vouchers WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result[0]);
  });
});

// ===================== INSERT NEW VOUCHER =====================
router.post("/", (req, res) => {
  const {
    SupplierName,
    VoucherDate,
    ModeOfPayment,
    Amount,
    Details,
    PaymentAgainst,
    ReferenceNo,
    BankAccountName,
    AccountHead,
    StaffName,
    VoucherRefNo
  } = req.body;

  const yearId = req.headers['x-year-id'];
  const sql = `
    INSERT INTO vouchers 
    (SupplierName, VoucherDate, VoucherRefNo, AccountHead, BankAccountName, 
     ModeOfPayment, StaffName, Details, PaymentAgainst, ReferenceNo, Amount, year_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      SupplierName,
      VoucherDate,
      VoucherRefNo,
      AccountHead,
      BankAccountName,
      ModeOfPayment,
      StaffName,
      Details,
      PaymentAgainst,
      ReferenceNo,
      Amount,
      yearId
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Voucher Saved Successfully!", id: result.insertId });
    }
  );
});

// ===================== UPDATE VOUCHER =====================
router.put("/:id", (req, res) => {
  const { id } = req.params;

  const {
    SupplierName,
    VoucherDate,
    ModeOfPayment,
    Amount,
    Details,
    PaymentAgainst,
    ReferenceNo,
    BankAccountName,
    AccountHead,
    StaffName,
    VoucherRefNo
  } = req.body;

  const sql = `
    UPDATE vouchers SET
      SupplierName=?, 
      VoucherDate=?, 
      VoucherRefNo=?, 
      AccountHead=?, 
      BankAccountName=?, 
      ModeOfPayment=?, 
      StaffName=?, 
      Details=?, 
      PaymentAgainst=?, 
      ReferenceNo=?, 
      Amount=?
    WHERE id=?
  `;

  db.query(
    sql,
    [
      SupplierName,
      VoucherDate,
      VoucherRefNo,
      AccountHead,
      BankAccountName,
      ModeOfPayment,
      StaffName,
      Details,
      PaymentAgainst,
      ReferenceNo,
      Amount,
      id
    ],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Voucher Updated Successfully!" });
    }
  );
});

// ===================== DELETE VOUCHER =====================
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM vouchers WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Voucher Deleted Successfully!" });
  });
});

export default router;
