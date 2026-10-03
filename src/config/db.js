import {Pool} from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

pool.query("SELECT 1")
    .then(() => {
        console.log("PostgreSQL connected successfully");
    })
    .catch((error) => {
        console.error("PostgreSQL connection failed:", error.message);
    });
export default pool;
