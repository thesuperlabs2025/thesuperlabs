import mysql from 'mysql2/promise';

const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
};

async function migrateYarnSku() {
    let connection;
    try {
        connection = await mysql.createConnection(connectionConfig);
        console.log('Connected to database.');

        // 1. Add yarn_sku column if not exists
        console.log('Checking for yarn_sku column...');
        const [columns] = await connection.query('DESCRIBE yarn');
        const hasSku = columns.some(col => col.Field === 'yarn_sku');

        if (!hasSku) {
            console.log('Adding yarn_sku column...');
            await connection.query('ALTER TABLE yarn ADD COLUMN yarn_sku VARCHAR(255) AFTER id');
            console.log('yarn_sku column added.');
        }

        // 2. Populate existing rows with auto-generated SKUs
        // counts-yarn name-color-composition
        console.log('Populating SKUs for existing yarn...');
        const [yarns] = await connection.query('SELECT * FROM yarn');
        for (const y of yarns) {
            const counts = (y.counts || '').trim();
            const name = (y.yarn_name || '').trim();
            const color = (y.color || '').trim();
            const composition = (y.composition || '').trim();

            let sku = [counts, name, color, composition].filter(Boolean).join('-').toLowerCase().replace(/\s+/g, '-');

            if (!sku) sku = `yarn-${y.id}`;

            await connection.query('UPDATE yarn SET yarn_sku = ? WHERE id = ?', [sku, y.id]);
        }
        console.log('Existing SKUs populated.');

        // 3. Make yarn_sku UNIQUE
        console.log('Adding UNIQUE constraint to yarn_sku...');
        const [indexes] = await connection.query("SHOW INDEX FROM yarn WHERE Column_name = 'yarn_sku' AND Non_unique = 0");

        if (indexes.length === 0) {
            try {
                await connection.query('ALTER TABLE yarn ADD UNIQUE (yarn_sku)');
                console.log('UNIQUE constraint added successfully.');
            } catch (err) {
                console.warn('Could not add UNIQUE constraint (maybe duplicate SKUs exist).', err.message);
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

migrateYarnSku();
