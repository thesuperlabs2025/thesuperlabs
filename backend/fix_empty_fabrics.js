import mysql from 'mysql2/promise';

const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: '14043011',
    database: 'garments'
};

async function fixEmptyFabricSkus() {
    let connection;
    try {
        connection = await mysql.createConnection(connectionConfig);
        console.log('Connected to database.');

        const [fabrics] = await connection.query('SELECT * FROM fabrics WHERE fabric_sku IS NULL OR fabric_sku = ""');
        console.log(`Found ${fabrics.length} fabrics with empty SKU.`);

        for (const f of fabrics) {
            const counts = (f.counts || '').trim();
            const name = (f.fabric_name || '').trim();
            const gsm = (f.gsm || '').trim();
            const dia = (f.dia || '').trim();
            const color = (f.color || '').trim();

            let sku = [counts, name, gsm, dia, color].filter(Boolean).join('-').toLowerCase().replace(/\s+/g, '-');

            if (!sku) sku = `fabric-${f.id}`;

            console.log(`Updating ID ${f.id} (${f.fabric_name}) with SKU: ${sku}`);

            try {
                await connection.query('UPDATE fabrics SET fabric_sku = ? WHERE id = ?', [sku, f.id]);
            } catch (err) {
                console.error(`Failed to update ID ${f.id}: ${err.message}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
        console.log('Connection closed.');
    }
}

fixEmptyFabricSkus();
