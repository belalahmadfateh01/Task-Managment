import express from 'express';
import path from "node:path";
import { fileURLToPath } from "node:url";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import ApiError from "./utils/ApiError.js";
import createCorsMiddleware from "./middlewares/cors.js";
import employeeRouter from "./routes/employees.route.js";
import reportRouter from "./routes/reports.route.js";
import commentRouter from "./routes/comment.route.js";
import taskRouter from "./routes/tasks.route.js";
import notificationsRouter from "./routes/notifications.route.js";
import pool from "./config/db.js";

const app = express();
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const trustedProxies = (process.env.TRUSTED_PROXIES || "")
    .split(",").map(address => address.trim()).filter(Boolean);
if (trustedProxies.length) app.set("trust proxy", trustedProxies);

app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on("finish", () => console.info(JSON.stringify({
        event: "http_request",
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Date.now() - startedAt,
    })));
    next();
});
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:3000,http://localhost:3002,http://127.0.0.1:3000,http://127.0.0.1:3002")
    .split(",").map(origin => origin.trim()).filter(Boolean);
app.use(createCorsMiddleware(allowedOrigins));

app.get("/health", async (_req, res) => {
    try {
        await pool.query("SELECT 1");
        res.status(200).json({ status: "ok", database: "ok" });
    } catch {
        res.status(503).json({ status: "error", database: "unavailable" });
    }
});

app.use(express.json({ limit: "1mb" }));
app.use(
  "/uploads/profiles",
  express.static(path.resolve(currentDir, "../uploads/profiles"))
);


app.use("/api/v1/employee", employeeRouter);
app.use("/api/v1/report", reportRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/task", taskRouter);
app.use("/api/v1/notification", notificationsRouter);

app.use((req, res, next) => {
    next(new ApiError(404, "Route not found"));
});

app.use(globalErrorHandler);

export default app;
