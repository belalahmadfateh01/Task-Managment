import {
    createTask, deleteTask, getTaskById, getTasks, updateTask, updateTaskStatus
} from "../services/tasks.service.js";
import catchAsyncError from "../utils/catchAsyncError.js";

const createTaskController = catchAsyncError(async (req, res) => {
    const task = await createTask(req.employee.id, req.body);
    res.status(201).json({ success: true, statusCode: 201, message: task });
});

const getTasksController = catchAsyncError(async (req, res) => {
    const tasks = await getTasks(req.employee);
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

const updateTaskController = catchAsyncError(async (req, res) => {
    const task = await updateTask(req.params.id, req.body);
    res.status(200).json({ success: true, statusCode: 200, message: task });
});

const deleteTaskController = catchAsyncError(async (req, res) => {
    await deleteTask(req.params.id);
    res.status(200).json({ success: true, statusCode: 200, message: "Task deleted successfully" });
});

export {
    createTaskController, getTasksController, getTaskByIdController,
    updateTaskStatusController, updateTaskController, deleteTaskController
};
