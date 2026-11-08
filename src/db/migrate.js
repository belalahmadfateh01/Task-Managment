import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "../config/db.js";

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../db/migrations");
const client = await pool.connect();
try {
    await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP)");
    const files = (await readdir(directory)).filter(file => file.endsWith(".sql")).sort();
    for (const file of files) {
        const alreadyApplied = await client.query("SELECT 1 FROM schema_migrations WHERE name = $1", [file]);
        if (alreadyApplied.rowCount) continue;
        const sql = await readFile(path.join(directory, file), "utf8");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        console.log(`Applied migration ${file}`);
    }
} catch (error) {
    console.error("Database migration failed:", error.message);
    process.exitCode = 1;
} finally {
    client.release();
    await pool.end();
}
