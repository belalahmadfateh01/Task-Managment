import {Router} from 'express';
import {
    createReportController,
    employeeReportsController,
    getAllReportController,
    getReportByIdController,
    reportStatsController,
    updateReportController,
    employeeReportStatsController,
    deleteReportContrller,
    reportAttachmentController,
    archiveReportController,
    markReportReadController
} from "../controllers/reports.controller.js";
import authentication from "../middlewares/authentication.js";
import authorization from "../middlewares/authorization.js";
import { validate, schemas } from "../middlewares/validate.js";
import reportUpload from "../middlewares/report-upload.middleware.js";
import reportAccess from "../middlewares/report-access.middleware.js";
import cleanupUploadedFile from "../middlewares/cleanup-upload.js";

const router = Router();

router.post('/', authentication, authorization("teacher"), reportUpload, cleanupUploadedFile, validate(schemas.report), createReportController);
router.get('/', authentication, authorization("admin"), validate(schemas.reportQuery), getAllReportController);
router.get('/teacher/:teacherId', authentication, validate(schemas.teacherId), validate(schemas.reportQuery), employeeReportsController);
router.get("/stats", authentication, authorization("admin"), reportStatsController);
router.get("/teacher/:teacherId/stats", authentication, validate(schemas.teacherId), employeeReportStatsController);
router.get('/:id/file', authentication, validate(schemas.id), reportAttachmentController);
router.get('/:id', authentication, validate(schemas.id), getReportByIdController);
router.patch('/:id', authentication, validate(schemas.id), reportAccess, reportUpload, cleanupUploadedFile, validate(schemas.reportUpdate), updateReportController);
router.patch('/:id/archive', authentication, authorization("admin"), validate(schemas.id), validate(schemas.archive), archiveReportController);
router.patch('/:id/read', authentication, authorization("admin"), validate(schemas.id), markReportReadController);
router.delete('/:id', authentication, validate(schemas.id), deleteReportContrller);

export default router;
