import catchAsyncError from "../utils/catchAsyncError.js";
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteReadNotifications } from "../services/notifications.service.js";

const getNotificationsController = catchAsyncError(async (req, res) => {
    const result = await getNotifications(req.employee, req.query);
    res.status(200).json({ success: true, statusCode: 200, message: result });
});

const markNotificationReadController = catchAsyncError(async (req, res) => {
    const result = await markNotificationRead(req.params.id, req.employee);
    res.status(200).json({ success: true, statusCode: 200, message: result });
});

const markAllNotificationsReadController = catchAsyncError(async (req, res) => {
    const result = await markAllNotificationsRead(req.employee);
    res.status(200).json({ success: true, statusCode: 200, message: result });
});

const deleteReadNotificationsController = catchAsyncError(async (req, res) => {
    const result = await deleteReadNotifications(req.employee);
    res.status(200).json({ success: true, statusCode: 200, message: result });
});

export { getNotificationsController, markNotificationReadController, markAllNotificationsReadController, deleteReadNotificationsController };
