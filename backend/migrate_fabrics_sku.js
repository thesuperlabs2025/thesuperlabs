import mysql from 'mysql2/promise';

const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
};

async function migrateFabrics() {
    let connection;
    try {
        connection = await mysql.createConnection(connectionConfig);
        console.log('Connected to database.');

        // 1. Add fabric_sku column if not exists
        console.log('Checking for fabric_sku column...');
        const [columns] = await connection.query('DESCRIBE fabrics');
        const hasSku = columns.some(col => col.Field === 'fabric_sku');

        if (!hasSku) {
            console.log('Adding fabric_sku column...');
            await connection.query('ALTER TABLE fabrics ADD COLUMN fabric_sku VARCHAR(255) AFTER id');
            console.log('fabric_sku column added.');
        }

        // 2. Populate existing rows with auto-generated SKUs
        console.log('Populating SKUs for existing fabrics...');
        const [fabrics] = await connection.query('SELECT * FROM fabrics');
        for (const f of fabrics) {
            // Counts-Fabricname-Gsm-dia-color
            const counts = (f.counts || '').trim();
            const name = (f.fabric_name || '').trim();
            const gsm = (f.gsm || '').trim();
            const dia = (f.dia || '').trim();
            const color = (f.color || '').trim();

            let sku = [counts, name, gsm, dia, color].filter(Boolean).join('-').toLowerCase().replace(/\s+/g, '-');

            // If SKU is empty (highly unlikely if there's a name), fallback to ID
            if (!sku) sku = `fabric-${f.id}`;

            await connection.query('UPDATE fabrics SET fabric_sku = ? WHERE id = ?', [sku, f.id]);
        }
        console.log('Existing SKUs populated.');

        // 3. Make fabric_sku UNIQUE
        console.log('Adding UNIQUE constraint to fabric_sku...');
        // Check if index already exists
        const [indexes] = await connection.query("SHOW INDEX FROM fabrics WHERE Column_name = 'fabric_sku' AND Non_unique = 0");

        if (indexes.length === 0) {
            try {
                await connection.query('ALTER TABLE fabrics ADD UNIQUE (fabric_sku)');
                console.log('UNIQUE constraint added successfully.');
            } catch (err) {
                console.warn('Could not add UNIQUE constraint (maybe duplicate SKUs exist). Please check manually.', err.message);
            }
        } else {
            console.log('UNIQUE constraint already exists.');
        }

    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        if (connection) await connection.end();
        console.log('Connection closed.');
    }
}

migrateFabrics();
