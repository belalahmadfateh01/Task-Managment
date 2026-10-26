import {Router} from 'express';
import {
    createReportController,
    employeeReportsController,
    getAllReportController,
    getReportByIdController,
    reportStatsController,
    updateReportController,
    employeeReportStatsController
} from "../controllers/reports.controller.js";
import authentication from "../middlewares/authentication.js";
import authorization from "../middlewares/authorization.js";

const router = Router();

router.post('/', authentication, authorization("teacher"), createReportController);
router.get('/', authentication, authorization("admin"), getAllReportController);
router.get('/teacher/:teacherId', authentication, employeeReportsController);
router.get("/stats", authentication, reportStatsController);
router.get("/teacher/:teacherId/stats", authentication, employeeReportStatsController);
router.get('/:id', authentication, getReportByIdController);
router.patch('/:id', authentication, updateReportController);

export default router;
