import {
    createReport,
    employeeReports,
    getAllReport,
    getReportById,
    reportStats,
    updateReport,
    employeeReportStats
} from "../services/reports.service.js";
import catchAsyncError from "../utils/catchAsyncError.js";

const createReportController = catchAsyncError(async (req, res) => {
    const data = req.body;
    data.teacher_id = req.employee.id;
    const newReport = await createReport(req.body);

    res.status(201).json({
        success: true, statusCode: 201, message: newReport
    });
});
const getAllReportController = catchAsyncError(async (req, res) => {
    const reports = await getAllReport();
    res.status(200).json({
        success: true, statusCode: 200, message: reports
    })
});
const getReportByIdController = catchAsyncError(async (req, res) => {
    const report = await getReportById(req.params.id);
    res.status(200).json({
        success: true, statusCode: 200, message: report
    });
});
const employeeReportsController = catchAsyncError(async (req, res) => {
    const employeeReport = await employeeReports(req.params.teacherId, req.employee.id, req.employee.role);
    res.status(200).json({
        success: true, statusCode: 200, message: employeeReport
    })
});
const updateReportController = catchAsyncError(async (req, res) => {
    const report = await updateReport(req.params.id, req.employee, req.body);
    res.status(200).json({
        success: true, statusCode: 200, message: report
    })
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

export {
    createReportController,
    getAllReportController,
    getReportByIdController,
    updateReportController,
    employeeReportsController,
    reportStatsController,
    employeeReportStatsController
};
