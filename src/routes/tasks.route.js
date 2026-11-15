import { Router } from "express";
import authentication from "../middlewares/authentication.js";
import authorization from "../middlewares/authorization.js";
import { validate, schemas } from "../middlewares/validate.js";
import {
    createTaskController, deleteTaskController, getTaskByIdController,
    getTasksController, updateTaskController, updateTaskStatusController,
    submitTaskResponseController
} from "../controllers/tasks.controller.js";

const router = Router();

router.use(authentication);
router.get("/", authorization("admin", "teacher"), validate(schemas.paginationQuery), getTasksController);
router.get("/:id", authorization("admin", "teacher"), validate(schemas.id), getTaskByIdController);
router.post("/", authorization("admin"), validate(schemas.task), createTaskController);
router.patch("/:id/status", authorization("teacher"), validate(schemas.id), validate(schemas.taskStatus), updateTaskStatusController);
router.patch("/:id/response", authorization("teacher"), validate(schemas.id), validate(schemas.taskResponse), submitTaskResponseController);
router.patch("/:id", authorization("admin"), validate(schemas.id), validate(schemas.taskUpdate), updateTaskController);
router.delete("/:id", authorization("admin"), validate(schemas.id), deleteTaskController);

export default router;
