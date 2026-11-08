import {Router} from 'express';
import {
    createReportController,
    employeeReportsController,
    getAllReportController,
    getReportByIdController,
    reportStatsController,
    updateReportController,
    employeeReportStatsController,
    deleteReportContrller
} from "../controllers/reports.controller.js";
import authentication from "../middlewares/authentication.js";
import authorization from "../middlewares/authorization.js";
import { validate, schemas } from "../middlewares/validate.js";

const router = Router();
router.use((req, res, next) => {
    console.log(`ROUTE MATCH report ${req.method} ${req.originalUrl}`);
    next();
});

router.post('/', authentication, authorization("teacher"), validate(schemas.report), createReportController);
router.get('/', authentication, authorization("admin"), validate(schemas.reportQuery), getAllReportController);
router.get('/teacher/:teacherId', authentication, validate(schemas.teacherId), validate(schemas.reportQuery), employeeReportsController);
router.get("/stats", authentication, authorization("admin"), reportStatsController);
router.get("/teacher/:teacherId/stats", authentication, validate(schemas.teacherId), employeeReportStatsController);
router.get('/:id', authentication, validate(schemas.id), getReportByIdController);
router.patch('/:id', authentication, validate(schemas.id), validate(schemas.reportUpdate), updateReportController);
router.delete('/:id', authentication, validate(schemas.id), deleteReportContrller);

export default router;
