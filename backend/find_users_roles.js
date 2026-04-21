import db from "./db.js";
const q = "SELECT id, username, name, role FROM users";
db.query(q, (err, data) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(data));
    process.exit();
});
