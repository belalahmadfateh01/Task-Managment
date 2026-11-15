import path from "node:path";
import { fileURLToPath } from "node:url";
import {
    createReport,
    deleteReport,
    employeeReports,
    employeeReportStats,
    getAllReport,
    getReportById,
    reportStats,
    updateReport,
    getReportAttachment,
    archiveReport,
    markReportRead
} from "../services/reports.service.js";
import catchAsyncError from "../utils/catchAsyncError.js";
import ApiError from "../utils/ApiError.js";

const reportUploadDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads/reports");

const createReportController = catchAsyncError(async (req, res) => {
    const data = req.body;
    data.teacher_id = req.employee.id;
    if (req.file) {
        delete data.remove_file;
        data.file_name = path.basename(req.file.originalname.replaceAll("\\", "/")).slice(0, 512);
        data.file_path = req.file.filename;
        data.file_size = req.file.size;
    }
    const newReport = await createReport(req.body);

    res.status(201).json({
        success: true, statusCode: 201, message: newReport
    });
});
const getAllReportController = catchAsyncError(async (req, res) => {
    const queryData = req.query;
    const reports = await getAllReport(queryData, req.employee);
    res.status(200).json({
        success: true, statusCode: 200, message: reports
    })
});
const getReportByIdController = catchAsyncError(async (req, res) => {
    const report = await getReportById(req.params.id, req.employee);
    res.status(200).json({
        success: true, statusCode: 200, message: report
    });
});
const employeeReportsController = catchAsyncError(async (req, res) => {
    const queryData = req.query;
    const employeeReport = await employeeReports(req.params.teacherId, req.employee, queryData);
    res.status(200).json({
        success: true, statusCode: 200, message: employeeReport
    })
});
const updateReportController = catchAsyncError(async (req, res) => {
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
    const report = await updateReport(req.params.id, req.employee, data);
    res.status(200).json({
        success: true, statusCode: 200, message: report
    })
});
const reportAttachmentController = catchAsyncError(async (req, res, next) => {
    const attachment = await getReportAttachment(req.params.id, req.employee);
    const fileName = path.basename(attachment.file_path);
    const fullPath = path.resolve(reportUploadDirectory, fileName);
    if (!fullPath.startsWith(`${reportUploadDirectory}${path.sep}`)) {
        throw new ApiError(404, "Attachment not found");
    }
    res.download(fullPath, attachment.file_name || fileName, error => {
        if (error && !res.headersSent) next(error);
    });
});
const archiveReportController = catchAsyncError(async (req, res) => {
    const report = await archiveReport(req.params.id, req.body.archived);
    res.status(200).json({ success: true, statusCode: 200, message: report });
});
const markReportReadController = catchAsyncError(async (req, res) => {
    const result = await markReportRead(req.params.id, req.employee);
    res.status(200).json({ success: true, statusCode: 200, message: result });
});
const reportStatsController = catchAsyncError(async (req, res) => {
    const stats = await reportStats();
    res.status(200).json({
        success: true, statusCode: 200, message: stats
    })
})
const employeeReportStatsController = catchAsyncError(async (req, res) => {
    const stats = await employeeReportStats(req.params.teacherId, req.employee);

    res.status(200).json({
        success: true,
        statusCode: 200,
        message: stats
    });
});
const deleteReportContrller = catchAsyncError(async (req, res) => {
    const Report = await deleteReport(req.params.id, req.employee);
    res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Report deleted successfully."
    })
})

export {
    createReportController,
    getAllReportController,
    getReportByIdController,
    updateReportController,
    employeeReportsController,
    reportStatsController,
    employeeReportStatsController,
    deleteReportContrller,
    reportAttachmentController,
    archiveReportController,
    markReportReadController
};
