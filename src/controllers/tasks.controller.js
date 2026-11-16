import path from "node:path";
import { fileURLToPath } from "node:url";
import {
    createTask, deleteTask, getTaskAttachment, getTaskById, getTasks, updateTask, updateTaskStatus, submitTaskResponse
} from "../services/tasks.service.js";
import catchAsyncError from "../utils/catchAsyncError.js";
import ApiError from "../utils/ApiError.js";

const taskUploadDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads/tasks");

const createTaskController = catchAsyncError(async (req, res) => {
    if (req.file) {
        req.body.file_name = path.basename(req.file.originalname.replaceAll("\\", "/")).slice(0, 512);
        req.body.file_path = req.file.filename;
        req.body.file_size = req.file.size;
    }
    const task = await createTask(req.employee.id, req.body);
    res.status(201).json({ success: true, statusCode: 201, message: task });
});

const getTasksController = catchAsyncError(async (req, res) => {
    const tasks = await getTasks(req.employee, req.query);
    res.status(200).json({ success: true, statusCode: 200, message: tasks });
});

const getTaskByIdController = catchAsyncError(async (req, res) => {
    const task = await getTaskById(req.params.id, req.employee);
    res.status(200).json({ success: true, statusCode: 200, message: task });
});

const updateTaskStatusController = catchAsyncError(async (req, res) => {
    const assignment = await updateTaskStatus(req.params.id, req.employee.id, req.body.status);
    res.status(200).json({ success: true, statusCode: 200, message: assignment });
});

const submitTaskResponseController = catchAsyncError(async (req, res) => {
    const assignment = await submitTaskResponse(req.params.id, req.employee.id, req.body.response);
    res.status(200).json({ success: true, statusCode: 200, message: assignment });
});

const updateTaskController = catchAsyncError(async (req, res) => {
    const data = { ...req.body };
    if (req.file) {
        delete data.remove_file;
        data.file_name = path.basename(req.file.originalname.replaceAll("\\", "/")).slice(0, 512);
        data.file_path = req.file.filename;
        data.file_size = req.file.size;
    } else if (data.remove_file === "true" || data.remove_file === true) {
        data.file_name = null;
        data.file_path = null;
        data.file_size = null;
        delete data.remove_file;
    }
    const task = await updateTask(req.params.id, data);
    res.status(200).json({ success: true, statusCode: 200, message: task });
});

const taskAttachmentController = catchAsyncError(async (req, res, next) => {
    const attachment = await getTaskAttachment(req.params.id, req.employee);
    const fileName = path.basename(attachment.file_path);
    const fullPath = path.resolve(taskUploadDirectory, fileName);
    if (!fullPath.startsWith(`${taskUploadDirectory}${path.sep}`)) {
        throw new ApiError(404, "Attachment not found");
    }
    res.download(fullPath, attachment.file_name || fileName, error => {
        if (error && !res.headersSent) next(error);
    });
});

const deleteTaskController = catchAsyncError(async (req, res) => {
    await deleteTask(req.params.id);
    res.status(200).json({ success: true, statusCode: 200, message: "Task deleted successfully" });
});

export {
    createTaskController, getTasksController, getTaskByIdController,
    updateTaskStatusController, submitTaskResponseController,
    updateTaskController, deleteTaskController, taskAttachmentController
};
