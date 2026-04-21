import bcrypt from "bcryptjs";
import db from "./db.js";

const username = "demo_user";
const password = "password123";
const role = "Admin";
const name = "Demo Admin";

async function createDemoUser() {
    const hashedPassword = await bcrypt.hash(password, 10);
    const q = "INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)";
    db.query(q, [username, hashedPassword, role, name], (err, result) => {
        if (err) console.error("Error creating demo user:", err);
        else console.log("Demo user created successfully!");
        db.end();
    });
}

createDemoUser();
