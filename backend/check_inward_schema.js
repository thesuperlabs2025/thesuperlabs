import db from './db.js';
db.query('DESCRIBE pcs_inward_items', (err, rows) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(rows, null, 2));
    process.exit();
});
