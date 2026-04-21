import db from "./db.js";

const createLeadMastersTables = async () => {
    const queries = [
        `CREATE TABLE IF NOT EXISTS lead_sources (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

        `CREATE TABLE IF NOT EXISTS product_types (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

        `CREATE TABLE IF NOT EXISTS lead_statuses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            color VARCHAR(20) DEFAULT '#0d6efd',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    ];

    try {
        for (const query of queries) {
            await db.promise().query(query);
        }
        console.log("✅ Lead masters tables created successfully.");

        // Insert some default data if empty
        const [sources] = await db.promise().query("SELECT COUNT(*) as count FROM lead_sources");
        if (sources[0].count === 0) {
            await db.promise().query("INSERT INTO lead_sources (name) VALUES ('Instagram'), ('Referral'), ('Website'), ('Direct'), ('Exhibition')");
        }

        const [statuses] = await db.promise().query("SELECT COUNT(*) as count FROM lead_statuses");
        if (statuses[0].count === 0) {
            await db.promise().query("INSERT INTO lead_statuses (name, color) VALUES ('New', '#0d6efd'), ('Contacted', '#0dcaf0'), ('Quotation Sent', '#ffc107'), ('Negotiation', '#6c757d'), ('Won', '#198754'), ('Lost', '#dc3545')");
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error creating lead masters tables:", err);
        process.exit(1);
    }
};

createLeadMastersTables();
