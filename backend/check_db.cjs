const mysql = require('mysql2/promise');

async function check() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "14043011",
    database: "garments"
  });

  try {
    const [all] = await connection.query("SELECT id, po_no, year_id, create_date FROM yarn_po");
    console.log("ALL Yarn POs:", all);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

check();
