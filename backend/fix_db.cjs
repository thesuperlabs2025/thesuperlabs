const mysql = require('mysql2/promise');

async function fix() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "14043011",
    database: "garments"
  });

  try {
    // 1. Update existing records that are in 25-26 but labeled as Year 1
    const [result] = await connection.query(
      "UPDATE yarn_po SET year_id = 2 WHERE year_id = 1 AND create_date >= '2025-04-01'"
    );
    console.log(`Updated ${result.affectedRows} records in yarn_po.`);

    // 2. Clear default value of 1 for year_id if it's causing trouble (better to have no default or NULL)
    // Actually I'll leave the schema for now to avoid breaking other things, but fixing the frontend first is key.
    
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

fix();
