import db from "./db.js";

const migrate = async () => {
    try {
        console.log("Starting migration: Add image columns to planning tables...");

        // Add order_image to order_planning
        const [orderCols] = await db.promise().query("SHOW COLUMNS FROM order_planning LIKE 'order_image'");
        if (orderCols.length === 0) {
            await db.promise().query("ALTER TABLE order_planning ADD COLUMN order_image VARCHAR(255) AFTER is_bundle");
            console.log("Added order_image to order_planning");
        } else {
            console.log("order_image already exists in order_planning");
        }

        // Add style_image to style_planning
        const [styleCols] = await db.promise().query("SHOW COLUMNS FROM style_planning LIKE 'style_image'");
        if (styleCols.length === 0) {
            await db.promise().query("ALTER TABLE style_planning ADD COLUMN style_image VARCHAR(255) AFTER life_cycle");
            console.log("Added style_image to style_planning");
        } else {
            console.log("style_image already exists in style_planning");
        }

        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrate();
