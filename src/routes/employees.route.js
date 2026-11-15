import {Router} from 'express';
import {
    deleteEmployeeController,
    getAllEmployeeController,
    getEmployeeController,
    loginController,
    logoutController,
    registertionController,
    updateEmployeeController,
    uploadProfileImageController
} from "../controllers/employees.controller.js";
import authentication from "../middlewares/authentication.js";
import authorization from "../middlewares/authorization.js";
import { validate, schemas } from "../middlewares/validate.js";
import uploadProfileImage from "../middlewares/upload.middleware.js";
import cleanupUploadedFile from "../middlewares/cleanup-upload.js";
import loginRateLimit from "../middlewares/login-rate-limit.js";

const router = Router();

router.post("/register", authentication, authorization("admin"), validate(schemas.register), registertionController);
router.get("/", authentication, authorization("admin"), validate(schemas.paginationQuery), getAllEmployeeController);
router.patch("/profile/image", authentication, uploadProfileImage, cleanupUploadedFile, uploadProfileImageController);
router.patch("/:id/profile/image", authentication, authorization("admin"), validate(schemas.id), uploadProfileImage, cleanupUploadedFile, uploadProfileImageController);
router.get("/:id", authentication, validate(schemas.id), getEmployeeController);
router.post("/login", validate(schemas.login), loginRateLimit, loginController);
router.post("/logout", logoutController);
router.patch("/:id", authentication, validate(schemas.id), validate(schemas.profile), updateEmployeeController);
router.delete("/:id", authentication, authorization("admin"), validate(schemas.id), deleteEmployeeController);


export default router;
