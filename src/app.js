import express from 'express';
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import employeeRouter from "./routes/employees.route.js";
import reportRouter from "./routes/reports.route.js";
import commentRouter from "./routes/comment.route.js";
import taskRouter from "./routes/tasks.route.js";

const app = express();
app.use(express.json());

app.use("/api/v1/employee", employeeRouter);
app.use("/api/v1/report", reportRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/task", taskRouter);


app.use(globalErrorHandler);

export default app;
