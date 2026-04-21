import mysql from 'mysql2';

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
}).promise();

const tables = [
    'tna_headers',
    'pcs_inward',
    'pcs_outward',
    'fabric_to_pcs_inward',
    'fabric_to_pcs_outward',
    'yarn_dyeing_inward',
    'yarn_dyeing_outward'
];

async function migrate() {
    try {
        console.log("Starting migration (ESM)...");

        // 1. Add year_id to missing tables
        for (const table of tables) {
            console.log(`Checking table: ${table}`);
            try {
                const [cols] = await db.query(`DESC ${table}`);
                const hasYearId = cols.map(c => c.Field).includes('year_id');
                
                if (!hasYearId) {
                    console.log(`Adding year_id to ${table}...`);
                    await db.query(`ALTER TABLE ${table} ADD COLUMN year_id INT DEFAULT 1`);
                    console.log(`Column added to ${table}`);
                } else {
                    console.log(`${table} already has year_id`);
                }
            } catch (e) {
                console.log(`Error checking table ${table}: ${e.message}`);
            }
        }

        // 2. Ensure 2025-26 exists
        const [years] = await db.query("SELECT * FROM accounting_years WHERE year_name LIKE '%25-26%'");
        if (years.length === 0) {
            console.log("Creating 2025-26 accounting year...");
            await db.query(
                "INSERT INTO accounting_years (year_name, start_date, end_date, is_active, is_closed) VALUES (?, ?, ?, ?, ?)",
                ['2025-26', '2025-04-01', '2026-03-31', 1, 0]
            );
            console.log("2025-26 created");
            
            // Set 24-25 to inactive
            await db.query("UPDATE accounting_years SET is_active = 0 WHERE year_name LIKE '%24-25%'");
        }

        // 3. Backfill data based on dates
        const [allYears] = await db.query("SELECT * FROM accounting_years");
        const yr2526 = allYears.find(y => y.year_name.includes('25-26'));
        
        if (yr2526) {
            const yid25 = yr2526.year_id;
            const tablesWithDate = {
                'invoices': 'invoice_date',
                'order_planning': 'order_date',
                'receipts': 'TransactionDate',
                'purchases': 'purchase_date',
                'tna_headers': 'created_at',
                'pcs_inward': 'inward_date',
                'pcs_outward': 'outward_date',
                'fabric_to_pcs_inward': 'inward_date',
                'fabric_to_pcs_outward': 'outward_date',
                'yarn_dyeing_inward': 'inward_date',
                'yarn_dyeing_outward': 'outward_date',
                'dc': 'dc_date',
                'po': 'po_date',
                'grn': 'grn_date',
                'quotation': 'quotation_date',
                'pi': 'pi_date'
            };

            for (const [t, dateCol] of Object.entries(tablesWithDate)) {
                try {
                    console.log(`Updating year_id for ${t} based on ${dateCol}...`);
                    // Specifically check if ${t} exists first
                    await db.query(`SELECT 1 FROM ${t} LIMIT 1`);
                    await db.query(`UPDATE ${t} SET year_id = ? WHERE ${dateCol} >= '2025-04-01'`, [yid25]);
                } catch (e) {
                    console.log(`Skipping update for ${t}: ${e.message}`);
                }
            }
        }

        console.log("Migration finished successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        // use synchronous method to end
        process.exit(0);
    }
}

migrate();
