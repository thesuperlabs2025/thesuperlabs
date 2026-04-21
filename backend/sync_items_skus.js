import mysql from 'mysql2/promise';

const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
};

async function syncSkus() {
    let connection;
    try {
        connection = await mysql.createConnection(connectionConfig);
        console.log('Connected to database.');

        // Function to slugify
        const slugify = (parts) => parts.filter(Boolean).join('-').toLowerCase().replace(/\s+/g, '-');

        // 1. Yarn PO & GRN
        console.log('Syncing Yarn SKUs...');
        const [yarnPoItems] = await connection.query('SELECT * FROM yarn_po_items WHERE yarn_sku IS NULL OR yarn_sku = ""');
        for (const it of yarnPoItems) {
            const sku = slugify([it.counts, it.yarn_name, it.color]);
            await connection.query('UPDATE yarn_po_items SET yarn_sku = ? WHERE id = ?', [sku, it.id]);
        }
        const [yarnGrnItems] = await connection.query('SELECT * FROM yarn_grn_items WHERE yarn_sku IS NULL OR yarn_sku = ""');
        for (const it of yarnGrnItems) {
            const sku = slugify([it.counts, it.yarn_name, it.color]);
            await connection.query('UPDATE yarn_grn_items SET yarn_sku = ? WHERE id = ?', [sku, it.id]);
        }

        // 2. Fabric PO & GRN
        console.log('Syncing Fabric SKUs...');
        const [fabricPoItems] = await connection.query('SELECT * FROM fabric_po_items WHERE fabric_sku IS NULL OR fabric_sku = ""');
        for (const it of fabricPoItems) {
            const sku = slugify([it.fabric_name, it.color, it.gsm, it.dia]);
            await connection.query('UPDATE fabric_po_items SET fabric_sku = ? WHERE id = ?', [sku, it.id]);
        }
        const [fabricGrnItems] = await connection.query('SELECT * FROM fabric_grn_items WHERE fabric_sku IS NULL OR fabric_sku = ""');
        for (const it of fabricGrnItems) {
            const sku = slugify([it.fabric_name, it.color, it.gsm, it.dia]);
            await connection.query('UPDATE fabric_grn_items SET fabric_sku = ? WHERE id = ?', [sku, it.id]);
        }

        // 3. Trims PO & GRN
        console.log('Syncing Trims SKUs...');
        const [trimsPoItems] = await connection.query('SELECT * FROM trims_po_items WHERE trims_sku IS NULL OR trims_sku = ""');
        for (const it of trimsPoItems) {
            const sku = slugify([it.trims_name, it.color, it.size]);
            await connection.query('UPDATE trims_po_items SET trims_sku = ? WHERE id = ?', [sku, it.id]);
        }
        const [trimsGrnItems] = await connection.query('SELECT * FROM trims_grn_items WHERE trims_sku IS NULL OR trims_sku = ""');
        for (const it of trimsGrnItems) {
            const sku = slugify([it.trims_name, it.color, it.size]);
            await connection.query('UPDATE trims_grn_items SET trims_sku = ? WHERE id = ?', [sku, it.id]);
        }

        console.log('SKU sync completed.');

    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        if (connection) await connection.end();
        console.log('Connection closed.');
    }
}

syncSkus();
