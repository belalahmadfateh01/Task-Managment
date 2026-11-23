import { Router } from "express";
import authentication from "../middlewares/authentication.js";
import authorization from "../middlewares/authorization.js";
import { validate, schemas } from "../middlewares/validate.js";
import taskUpload from "../middlewares/task-upload.middleware.js";
import reportUpload from "../middlewares/report-upload.middleware.js";
import cleanupUploadedFile from "../middlewares/cleanup-upload.js";
import {
    createTaskController, deleteTaskController, getTaskByIdController,
    getTasksController, updateTaskController, updateTaskStatusController,
    submitTaskResponseController, taskAttachmentController
} from "../controllers/tasks.controller.js";

const router = Router();

const normalizeTaskMultipartFields = (req, _res, next) => {
    req.body ??= {};
    if (typeof req.body.teacher_ids === "string") {
        try {
            req.body.teacher_ids = JSON.parse(req.body.teacher_ids);
        } catch {
            req.body.teacher_ids = [];
        }
    }
    for (const field of ["description", "start_date", "deadline"]) {
        if (req.body[field] === "") req.body[field] = null;
    }
    next();
};

router.use(authentication);
router.get("/", authorization("admin", "teacher"), validate(schemas.paginationQuery), getTasksController);
router.get("/:id/file", authorization("admin", "teacher"), validate(schemas.id), taskAttachmentController);
router.get("/:id", authorization("admin", "teacher"), validate(schemas.id), getTaskByIdController);
router.post("/", authorization("admin"), taskUpload, cleanupUploadedFile, normalizeTaskMultipartFields, validate(schemas.task), createTaskController);
router.patch("/:id/status", authorization("teacher"), validate(schemas.id), validate(schemas.taskStatus), updateTaskStatusController);
router.patch("/:id/response", authorization("teacher"), validate(schemas.id), reportUpload, cleanupUploadedFile, validate(schemas.taskResponse), submitTaskResponseController);
router.patch("/:id", authorization("admin"), validate(schemas.id), taskUpload, cleanupUploadedFile, normalizeTaskMultipartFields, validate(schemas.taskUpdate), updateTaskController);
router.delete("/:id", authorization("admin"), validate(schemas.id), deleteTaskController);

export default router;
