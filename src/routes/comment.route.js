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

const router = Router();

router.post("/:reportId", authentication, authorization("admin"), createCommentController);
router.get("/", authentication, authorization("admin"), getAllCommentsController);
router.get('/:reportId', authentication, getReportCommentController);
router.patch("/:id", authentication, authorization("admin"), updateCommentController);
router.delete("/:id", authentication, authorization("admin"), deleteCommentController)


export default router;