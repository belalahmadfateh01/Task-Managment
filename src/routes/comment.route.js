import {Router} from 'express';
import {
    createCommentController,
    getAllCommentsController,
    getReportCommentController,
    updateCommentController,
    deleteCommentController
} from '../controllers/comment.controller.js';
import authorization from "../middlewares/authorization.js";
import authentication from "../middlewares/authentication.js";
import { validate, schemas } from "../middlewares/validate.js";

const router = Router();
router.use((req, res, next) => {
    console.log(`ROUTE MATCH comment ${req.method} ${req.originalUrl}`);
    next();
});

router.post("/:reportId", authentication, authorization("admin"), validate(schemas.reportId), validate(schemas.comment), createCommentController);
router.get("/", authentication, authorization("admin"), validate(schemas.paginationQuery), getAllCommentsController);
router.get('/:reportId', authentication, validate(schemas.reportId), validate(schemas.paginationQuery), getReportCommentController);
router.patch("/:id", authentication, authorization("admin"), validate(schemas.id), validate(schemas.comment), updateCommentController);
router.delete("/:id", authentication, authorization("admin"), validate(schemas.id), deleteCommentController)


export default router;
