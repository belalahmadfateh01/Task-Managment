import { Router } from "express";
import authentication from "../middlewares/authentication.js";
import authorization from "../middlewares/authorization.js";
import {
    createTaskController, deleteTaskController, getTaskByIdController,
    getTasksController, updateTaskController, updateTaskStatusController
} from "../controllers/tasks.controller.js";

const router = Router();

router.use(authentication);
router.get("/", authorization("admin", "teacher"), getTasksController);
router.get("/:id", authorization("admin", "teacher"), getTaskByIdController);
router.post("/", authorization("admin"), createTaskController);
router.patch("/:id/status", authorization("teacher"), updateTaskStatusController);
router.patch("/:id", authorization("admin"), updateTaskController);
router.delete("/:id", authorization("admin"), deleteTaskController);

export default router;
