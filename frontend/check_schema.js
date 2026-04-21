import db from "../backend/db.js";

db.query("DESCRIBE invoices", (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(JSON.stringify(rows));
  process.exit(0);
});
