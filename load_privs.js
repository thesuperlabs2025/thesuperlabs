import db from './backend/db.js';

const pq = `
  SELECT m.module_name, 
         p.can_add, p.can_update, p.can_delete, p.can_view, p.can_print
  FROM privileges p
  JOIN modules m ON m.id = p.module_id
  WHERE p.usertype_id = 2
`;

db.query(pq, (err, rows) => {
    if (err) console.error(err);
    const privileges = {};
    rows.forEach(p => {
        privileges[p.module_name] = p;
    });
    console.log('PRIVS:', JSON.stringify(privileges));
    process.exit(0);
});
