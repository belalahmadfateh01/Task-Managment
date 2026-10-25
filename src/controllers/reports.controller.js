import {createReport, getAllReport, getReportById} from "../services/reports.service.js";
import catchAsyncError from "../utils/catchAsyncError.js";

const createReportController = catchAsyncError(async (req, res) => {
    const data = req.body;
    data.teacher_id = req.employee.id;
    const newReport = await createReport(req.body);

    res.status(201).json({
        success: true,
        statusCode: 201,
        message: newReport
    });
})
const getAllReportController = catchAsyncError(async (req, res) => {
    const reports = await getAllReport();
    res.status(200).json({
        success: true,
        statusCode: 200,
        message: reports
    })
});
const getReportByIdController = catchAsyncError(async (req, res) => {
    const report = await getReportById(req.params.id);
    res.status(200).json({
        success: true,
        statusCode: 200,
        message: report
    });
});

const updateReportController = catchAsyncError(async (req, res) => {
    const data = req.body;
    const report = await updateReport(data);
})

export {createReportController, getAllReportController, getReportByIdController, updateReportController};
