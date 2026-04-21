import db from "./db.js";
const q = "SELECT username, name FROM users LIMIT 5";
db.query(q, (err, data) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(data));
    db.end();
});
