import express from 'express';
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import ApiError from "./utils/ApiError.js";
import createCorsMiddleware from "./middlewares/cors.js";
import employeeRouter from "./routes/employees.route.js";
import reportRouter from "./routes/reports.route.js";
import commentRouter from "./routes/comment.route.js";
import taskRouter from "./routes/tasks.route.js";

const app = express();
app.use((req, res, next) => {
    const startedAt = Date.now();
    console.log(`REQUEST START ${req.method} ${req.originalUrl}`);
    res.on("finish", () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`));
    res.on("close", () => {
        if (!res.writableEnded) console.warn(`REQUEST CLOSED BEFORE RESPONSE ${req.method} ${req.originalUrl}`);
    });
    next();
});
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:3000,http://localhost:3001")
    .split(",").map(origin => origin.trim()).filter(Boolean);
app.use(createCorsMiddleware(allowedOrigins));

app.use(express.json({ limit: "1mb" }));


app.use("/api/v1/employee", employeeRouter);
app.use("/api/v1/report", reportRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/task", taskRouter);

app.use((req, res, next) => {
    next(new ApiError(404, "Route not found"));
});

app.use(globalErrorHandler);

export default app;
