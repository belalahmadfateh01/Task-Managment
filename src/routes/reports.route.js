import {Router} from 'express';
import {createReportController, getAllReportController, getReportByIdController, updateReportController} from "../controllers/reports.controller.js";
import authentication from "../middlewares/authentication.js";
import authorization from "../middlewares/authorization.js";

const router = Router();

router.post('/', authentication, authorization("teacher"), createReportController);
router.get('/', authentication, authorization("admin"), getAllReportController);
router.get('/:id',authentication , authorization("admin"), getReportByIdController);
router.patch('/:id', authentication, authorization("teacher"), updateReportController);

export default router;
