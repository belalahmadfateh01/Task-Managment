import {
    createReport,
    deleteReport,
    employeeReports,
    employeeReportStats,
    getAllReport,
    getReportById,
    reportStats,
    updateReport
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
    const queryData = req.query;
    const reports = await getAllReport(queryData);
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
    deleteReportContrller
};
