import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // 1️⃣ Get user info
  const q = "SELECT * FROM users WHERE username = ?";
  db.query(q, [username], async (err, data) => {
    if (err) return res.status(500).json({ message: "Server Error" });
    if (data.length === 0) return res.status(401).json({ message: "User Not Found" });

    const user = data[0];

    // 2️⃣ Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid Password" });

    // 3️⃣ Get usertype_id from user_types table
    const utQuery = "SELECT id AS usertype_id FROM user_types WHERE role = ?";
    db.query(utQuery, [user.role], (err2, utData) => {
      if (err2) return res.status(500).json({ message: "UserType Error" });

      const usertype_id = utData[0]?.usertype_id || null;

      // 4️⃣ Fetch privileges for this usertype
      const pq = `
        SELECT m.module_name,
               p.can_add, p.can_update, p.can_delete, p.can_view, p.can_print
        FROM privileges p
        JOIN modules m ON m.id = p.module_id
        WHERE p.usertype_id = ?
      `;
      db.query(pq, [usertype_id], (err3, privData) => {
        if (err3) return res.status(500).json({ message: "Privilege Error" });

        // Convert privileges to object per module
        const privileges = {};
        privData.forEach(p => {
          privileges[p.module_name] = p;
        });

        // 5️⃣ Generate token using .env secret ✅
        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          process.env.JWT_SECRET,  // ← use .env not hardcoded!
          { expiresIn: "1d" }
        );

        // 6️⃣ Fetch all accounting years for year selection screen
        const yearQuery = "SELECT * FROM accounting_years ORDER BY start_date DESC";
        db.query(yearQuery, (err4, yearData) => {
          if (err4) return res.status(500).json({ message: "Accounting Years Error" });

          // 7️⃣ Send full response
          res.json({
            message: "Login Successful",
            token,
            user: {
              id: user.id,
              username: user.username,
              name: user.name,
              email: user.email,
              role: user.role,
              usertype_id
            },
            privileges,
            years: yearData
          });
        });
      });
    });
  });
});

export default router;






// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import db from "../db.js";

// const router = express.Router();

// router.post("/login", (req, res) => {
//   const { username, password } = req.body;

//   // 1️⃣ Get user info
//   const q = "SELECT * FROM users WHERE username = ?";
//   db.query(q, [username], async (err, data) => {
//     if (err) return res.status(500).json({ message: "Server Error" });
//     if (data.length === 0) return res.status(401).json({ message: "User Not Found" });

//     const user = data[0];

//     // 2️⃣ Check password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) return res.status(401).json({ message: "Invalid Password" });

//     // 3️⃣ Get usertype_id from user_types table
//     const utQuery = "SELECT id AS usertype_id FROM user_types WHERE role = ?";
//     db.query(utQuery, [user.role], (err2, utData) => {
//       if (err2) return res.status(500).json({ message: "UserType Error" });

//       const usertype_id = utData[0]?.usertype_id || null;

//       // 4️⃣ Fetch privileges for this usertype
//       const pq = `
//         SELECT m.module_name,
//                p.can_add, p.can_update, p.can_delete, p.can_view, p.can_print
//         FROM privileges p
//         JOIN modules m ON m.id = p.module_id
//         WHERE p.usertype_id = ?
//       `;
//       db.query(pq, [usertype_id], (err3, privData) => {
//         if (err3) return res.status(500).json({ message: "Privilege Error" });

//         // convert privileges to object per module
//         const privileges = {};
//         privData.forEach(p => {
//           privileges[p.module_name] = p;
//         });

//         // 5️⃣ Generate token
//         const token = jwt.sign(
//           { id: user.id, username: user.username, role: user.role },
//           "SECRET_KEY",
//           { expiresIn: "1d" }
//         );

//         // 6️⃣ Send full response
//         res.json({
//           message: "Login Successful",
//           token,
//           user: {
//             id: user.id,
//             username: user.username,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             usertype_id // ✅ include this
//           },
//           privileges
//         });
//       });
//     });
//   });
// });

// export default router;
