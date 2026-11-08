import bcrypt from "bcrypt";
import pool from "../config/db.js";

const required = ["ADMIN_F_NAME", "ADMIN_L_NAME", "ADMIN_USER_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD"];
const missing = required.filter(key => !process.env[key]);
if (missing.length) throw new Error(`Missing administrator settings: ${missing.join(", ")}`);
if (process.env.ADMIN_PASSWORD.length < 8 || process.env.ADMIN_PASSWORD.length > 128) {
    throw new Error("ADMIN_PASSWORD must be 8-128 characters");
}

try {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock(73421901)");
        const existingAdmin = await client.query("SELECT 1 FROM employees WHERE role = 'admin' LIMIT 1");
        if (existingAdmin.rowCount) throw new Error("An administrator already exists");
        const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
        await client.query(
            `INSERT INTO employees (f_name, l_name, user_name, email, password, role)
             VALUES ($1, $2, $3, $4, $5, 'admin')`,
            [process.env.ADMIN_F_NAME, process.env.ADMIN_L_NAME, process.env.ADMIN_USER_NAME, process.env.ADMIN_EMAIL, hash]
        );
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
    } finally {
        client.release();
    }
    console.log("Administrator account created");
} catch (error) {
    console.error("Administrator creation failed:", error.message);
    process.exitCode = 1;
} finally {
    await pool.end();
}
