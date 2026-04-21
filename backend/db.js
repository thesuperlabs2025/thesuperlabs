import "./env.js";
import mysql from "mysql2";

// Use environment variables for flexibility between local and server
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "14043011",
  database: process.env.DB_NAME || "garments",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const db = mysql.createPool(dbConfig);

// Test pool connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database pool connection failed:", err);
    console.error("Config used:", { ...dbConfig, password: "****" });
  } else {
    console.log(`✅ MySQL pool connected to ${dbConfig.database} at ${dbConfig.host}`);
    connection.release();
  }
});

export default db;
