
import db from './db.js';

db.query('ALTER TABLE garments_grn_items ADD COLUMN sku VARCHAR(255) AFTER style_name', (err) => {
    if (err) {
        console.error('Migration failed:', err.message);
    } else {
        console.log('Migration success: added sku to garments_grn_items');
    }
    db.end();
    process.exit(0);
});
