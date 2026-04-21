import db from './db.js';

async function setupMultiYear() {
    try {
        console.log("🚀 Starting Multi-Year Accounting Setup...");

        // 1. Create accounting_years table
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS accounting_years (
                year_id INT AUTO_INCREMENT PRIMARY KEY,
                year_name VARCHAR(20) NOT NULL UNIQUE,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                is_active BOOLEAN DEFAULT FALSE,
                is_closed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Created 'accounting_years' table.");

        // 2. Create voucher_sequences table
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS voucher_sequences (
                id INT AUTO_INCREMENT PRIMARY KEY,
                year_id INT NOT NULL,
                voucher_type VARCHAR(50) NOT NULL,
                prefix VARCHAR(20),
                last_no INT DEFAULT 0,
                UNIQUE KEY type_year (voucher_type, year_id),
                FOREIGN KEY (year_id) REFERENCES accounting_years(year_id)
            )
        `);
        console.log("✅ Created 'voucher_sequences' table.");

        // 3. Create opening_balances table
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS opening_balances (
                ob_id INT AUTO_INCREMENT PRIMARY KEY,
                year_id INT NOT NULL,
                account_id INT NOT NULL,
                dr_amount DECIMAL(15,2) DEFAULT 0.00,
                cr_amount DECIMAL(15,2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (year_id) REFERENCES accounting_years(year_id)
            )
        `);
        console.log("✅ Created 'opening_balances' table.");

        // 4. Insert Default Accounting Year (2024-25) if none exists
        const [years] = await db.promise().query("SELECT * FROM accounting_years");
        if (years.length === 0) {
            await db.promise().query(`
                INSERT INTO accounting_years (year_name, start_date, end_date, is_active)
                VALUES ('2024-25', '2024-04-01', '2025-03-31', TRUE)
            `);
            console.log("✅ Inserted default accounting year: 2024-25.");
        }

        // 5. Add year_id to transaction tables if not exists
        const tablesToUpdate = [
            'invoices', 'purchases', 'receipts', 'vouchers',
            'order_planning', 'order_planning_v2', 'production_lots',
            'style_planning', 'trims', 'fabrics', 'yarn',
            'fabric_grn', 'yarn_grn', 'trims_grn', 'garments_grn', 'general_grn',
            'fabric_po', 'yarn_po', 'trims_po', 'garments_po', 'general_po',
            'job_inward', 'job_outward', 'job_return'
        ];

        const [defaultYear] = await db.promise().query("SELECT year_id FROM accounting_years WHERE is_active = TRUE LIMIT 1");
        const yearId = defaultYear[0].year_id;

        for (const table of tablesToUpdate) {
            try {
                // Check if table exists
                const [tableExists] = await db.promise().query(`SHOW TABLES LIKE '${table}'`);
                if (tableExists.length === 0) continue;

                // Check if column exists
                const [columns] = await db.promise().query(`SHOW COLUMNS FROM ${table} LIKE 'year_id'`);
                if (columns.length === 0) {
                    await db.promise().query(`ALTER TABLE ${table} ADD COLUMN year_id INT DEFAULT ${yearId}`);
                    await db.promise().query(`ALTER TABLE ${table} ADD CONSTRAINT fk_${table}_year FOREIGN KEY (year_id) REFERENCES accounting_years(year_id)`);
                    console.log(`✅ Added 'year_id' to '${table}' table.`);
                }
            } catch (err) {
                console.warn(`⚠️ Could not update table '${table}':`, err.message);
            }
        }

        console.log("🎉 Multi-Year Setup Completed Successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Setup Failed:", err);
        process.exit(1);
    }
}

setupMultiYear();
