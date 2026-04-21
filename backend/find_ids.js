import db from './db.js';

db.query("INSERT INTO privileges (usertype_id, module_id, can_add, can_update, can_delete, can_view, can_print) SELECT 1, id, 1, 1, 1, 1, 1 FROM modules", (err) => {
    if (err) console.error(err);
    console.log('Privileges inserted');
    process.exit(0);
});
