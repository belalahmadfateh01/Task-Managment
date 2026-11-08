import { Pool } from 'pg';

const required = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"];
const missing = required.filter(key => !process.env[key]);
if (missing.length) throw new Error(`Missing database configuration: ${missing.join(", ")}`);

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionTimeoutMillis: 5000,
    query_timeout: 15000,
    statement_timeout: 15000,
});

pool.on("error", error => console.error("Unexpected PostgreSQL pool error:", error.message));

export default pool;
