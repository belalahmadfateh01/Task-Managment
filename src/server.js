import app from "./app.js";
import pool from "./config/db.js";
const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
}

try {
    await pool.query("SELECT 1");
    const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    const shutdown = async signal => {
        console.log(`${signal} received; closing server`);
        server.close(async () => {
            await pool.end();
            process.exit(0);
        });
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
} catch (error) {
    console.error("Server startup failed:", error.message);
    await pool.end();
    process.exitCode = 1;
}
