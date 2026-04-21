import db from './backend/db.js';

db.query('SELECT id FROM invoice ORDER BY id DESC LIMIT 1', (err, rows) => {
    if (err) console.error(err);
    console.log('Invoice Rows:', rows);
    process.exit(0);
});
