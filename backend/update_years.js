import db from './db.js';

async function updateYears() {
    try {
        // Deactivate all
        await db.promise().query('UPDATE accounting_years SET is_active = 0');
        
        // Check if 2025-26 exists
        const [rows] = await db.promise().query('SELECT * FROM accounting_years WHERE year_name = "2025-26"');
        
        if (rows.length === 0) {
            console.log("Inserting 2025-26...");
            await db.promise().query(
                'INSERT INTO accounting_years (year_name, start_date, end_date, is_active, is_closed) VALUES (?, ?, ?, ?, ?)',
                ['2025-26', '2025-04-01', '2026-03-31', 1, 0]
            );
        } else {
            console.log("Updating 2025-26 to active...");
            await db.promise().query('UPDATE accounting_years SET is_active = 1 WHERE year_name = "2025-26"');
        }
        
        console.log("Success!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateYears();
