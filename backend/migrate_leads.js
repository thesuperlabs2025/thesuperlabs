import db from "./db.js";

const createLeadsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS leads (
            id INT AUTO_INCREMENT PRIMARY KEY,
            lead_id VARCHAR(20) NOT NULL UNIQUE,
            lead_date DATE NOT NULL,
            company_name VARCHAR(255) NOT NULL,
            contact_person VARCHAR(100),
            mobile_number VARCHAR(20) NOT NULL,
            whatsapp_number VARCHAR(20),
            email_id VARCHAR(100),
            city VARCHAR(100),
            state VARCHAR(100),
            country VARCHAR(100),
            lead_source VARCHAR(100),
            assigned_sales_person VARCHAR(100),
            product_type VARCHAR(255),
            appointment_date DATETIME,
            reference_image VARCHAR(255),
            gst_number VARCHAR(20),
            address TEXT,
            lead_status ENUM('New', 'Contacted', 'Quotation Sent', 'Negotiation', 'Won', 'Lost') DEFAULT 'New',
            next_followup_date DATE,
            followup_notes TEXT,
            expected_closing_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    try {
        await db.promise().query(query);
        console.log("✅ Table 'leads' created or already exists.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error creating 'leads' table:", err);
        process.exit(1);
    }
};

createLeadsTable();
