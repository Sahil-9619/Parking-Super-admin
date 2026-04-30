import bcrypt from "bcrypt";
import { pool } from "./config/db.js";

const initializeDb = async () => {
    try {
        // Create table if it doesn't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Table 'admins' ready");

        const email = "admin@parkadda.com";
        const password = await bcrypt.hash("admin@parkadda", 10);

        // Check if admin already exists
        const check = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);
        if (check.rows.length === 0) {
            await pool.query(
                "INSERT INTO admins (email, password) VALUES ($1, $2)",
                [email, password]
            );
            console.log("✅ Admin created");
        } else {
            console.log("ℹ️ Admin already exists");
        }

        process.exit();
    } catch (err) {
        console.error("❌ Initialization error:", err);
        process.exit(1);
    }
};

initializeDb();