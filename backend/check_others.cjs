const mysql = require('mysql2/promise');

async function check() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "14043011",
    database: "garments"
  });

  try {
    const tables = ['fabric_po', 'trims_po', 'garments_po', 'general_po'];
    for (const t of tables) {
        const [counts] = await connection.query(`SELECT COUNT(*) as c FROM ${t} WHERE year_id = 1 AND create_date >= '2025-04-01'`);
        console.log(`${t} with year_id=1 and date >= 2025-04-01: ${counts[0].c}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

check();
