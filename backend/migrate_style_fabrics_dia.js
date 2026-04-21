import db from "./db.js";

const migrate = async () => {
    try {
        await db.promise().query("ALTER TABLE style_fabrics ADD COLUMN dia_chart_id INT AFTER counts");
        await db.promise().query("ALTER TABLE style_fabrics ADD COLUMN dia_data JSON AFTER dia_chart_id");
        console.log("Added dia_chart_id and dia_data to style_fabrics");
    } catch (err) {
        console.error("Migration error (maybe columns already exist):", err);
    } finally {
        process.exit();
    }
};

migrate();
