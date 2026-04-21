import db from "./db.js";

const migrate = async () => {
    try {
        // 1. Unique constraint for Style Name + Color
        // First, check if there are duplicates to avoid migration failure
        const [duplicates] = await db.promise().query(`
            SELECT style_name, style_color, COUNT(*) as count 
            FROM style_planning 
            GROUP BY style_name, style_color 
            HAVING count > 1
        `);

        if (duplicates.length > 0) {
            console.warn("Manual action required: Duplicate style_name and style_color found. Clean them before applying unique constraint.");
        } else {
            const [indices] = await db.promise().query("SHOW INDEX FROM style_planning WHERE Key_name = 'idx_style_name_color'");
            if (indices.length === 0) {
                await db.promise().query("ALTER TABLE style_planning ADD UNIQUE INDEX idx_style_name_color (style_name, style_color)");
                console.log("Added unique index for style_name and style_color");
            }
        }

        // 2. Dia Master Tables
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS dia_master (
                id INT AUTO_INCREMENT PRIMARY KEY,
                dia_name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS dia_master_values (
                id INT AUTO_INCREMENT PRIMARY KEY,
                dia_id INT NOT NULL,
                size VARCHAR(50) NOT NULL,
                dia_value VARCHAR(50) NOT NULL,
                FOREIGN KEY (dia_id) REFERENCES dia_master(id) ON DELETE CASCADE
            )
        `);

        console.log("Dia Master tables created successfully");

    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        process.exit();
    }
};

migrate();
