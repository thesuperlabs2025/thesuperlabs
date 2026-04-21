
import db from "./db.js";

const createTables = async () => {
    const tables = [
        // Yarn PO
        `CREATE TABLE IF NOT EXISTS yarn_po (
      id INT AUTO_INCREMENT PRIMARY KEY,
      po_no VARCHAR(50) UNIQUE,
      supplier_name VARCHAR(255),
      create_date DATE,
      staff_name VARCHAR(255),
      is_order_specific BOOLEAN DEFAULT FALSE,
      is_lot_specific BOOLEAN DEFAULT FALSE,
      order_id INT,
      order_no VARCHAR(100),
      order_name VARCHAR(255),
      lot_no VARCHAR(100),
      lot_name VARCHAR(255),
      remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS yarn_po_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      po_id INT,
      counts VARCHAR(100),
      yarn_name VARCHAR(255),
      color VARCHAR(100),
      per_bag VARCHAR(100),
      per_bag_qty DECIMAL(10,2),
      qty DECIMAL(10,2),
      FOREIGN KEY (po_id) REFERENCES yarn_po(id) ON DELETE CASCADE
    )`,

        // Fabric PO
        `CREATE TABLE IF NOT EXISTS fabric_po (
      id INT AUTO_INCREMENT PRIMARY KEY,
      po_no VARCHAR(50) UNIQUE,
      supplier_name VARCHAR(255),
      create_date DATE,
      staff_name VARCHAR(255),
      is_order_specific BOOLEAN DEFAULT FALSE,
      is_lot_specific BOOLEAN DEFAULT FALSE,
      order_id INT,
      order_no VARCHAR(100),
      order_name VARCHAR(255),
      lot_no VARCHAR(100),
      lot_name VARCHAR(255),
      remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS fabric_po_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      po_id INT,
      counts VARCHAR(100),
      fabric_name VARCHAR(255),
      color VARCHAR(100),
      gsm VARCHAR(50),
      dia VARCHAR(50),
      rolls INT,
      qty DECIMAL(10,2),
      FOREIGN KEY (po_id) REFERENCES fabric_po(id) ON DELETE CASCADE
    )`,

        // Trims PO
        `CREATE TABLE IF NOT EXISTS trims_po (
      id INT AUTO_INCREMENT PRIMARY KEY,
      po_no VARCHAR(50) UNIQUE,
      supplier_name VARCHAR(255),
      create_date DATE,
      staff_name VARCHAR(255),
      is_order_specific BOOLEAN DEFAULT FALSE,
      is_lot_specific BOOLEAN DEFAULT FALSE,
      order_id INT,
      order_no VARCHAR(100),
      order_name VARCHAR(255),
      lot_no VARCHAR(100),
      lot_name VARCHAR(255),
      remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS trims_po_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      po_id INT,
      trims_name VARCHAR(255),
      color VARCHAR(100),
      size VARCHAR(50),
      qty DECIMAL(10,2),
      FOREIGN KEY (po_id) REFERENCES trims_po(id) ON DELETE CASCADE
    )`,

        // Garments PO
        `CREATE TABLE IF NOT EXISTS garments_po (
      id INT AUTO_INCREMENT PRIMARY KEY,
      po_no VARCHAR(50) UNIQUE,
      supplier_name VARCHAR(255),
      create_date DATE,
      staff_name VARCHAR(255),
      order_id INT,
      order_no VARCHAR(100),
      order_name VARCHAR(255),
      remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS garments_po_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      po_id INT,
      style_name VARCHAR(255),
      color VARCHAR(100),
      size VARCHAR(50),
      qty DECIMAL(10,2),
      FOREIGN KEY (po_id) REFERENCES garments_po(id) ON DELETE CASCADE
    )`,

        // General PO
        `CREATE TABLE IF NOT EXISTS general_po (
      id INT AUTO_INCREMENT PRIMARY KEY,
      po_no VARCHAR(50) UNIQUE,
      supplier_name VARCHAR(255),
      create_date DATE,
      staff_name VARCHAR(255),
      po_type ENUM('Yarn', 'Fabric', 'Trims') NOT NULL,
      remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS general_po_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      po_id INT,
      counts VARCHAR(100),
      yarn_name VARCHAR(255),
      fabric_name VARCHAR(255),
      trims_name VARCHAR(255),
      color VARCHAR(100),
      size VARCHAR(50),
      gsm VARCHAR(50),
      dia VARCHAR(50),
      per_bag VARCHAR(100),
      per_bag_qty DECIMAL(10,2),
      rolls INT,
      qty DECIMAL(10,2),
      FOREIGN KEY (po_id) REFERENCES general_po(id) ON DELETE CASCADE
    )`
    ];

    for (const query of tables) {
        try {
            await new Promise((resolve, reject) => {
                db.query(query, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log("Table created/verified successfully.");
        } catch (err) {
            console.error("Error creating table:", err);
        }
    }
    process.exit();
};

createTables();
