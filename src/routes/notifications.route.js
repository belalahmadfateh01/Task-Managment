import { Router } from "express";
import authentication from "../middlewares/authentication.js";
import { validate, schemas } from "../middlewares/validate.js";
import {
    getNotificationsController,
    markNotificationReadController,
    markAllNotificationsReadController,
    deleteReadNotificationsController,
} from "../controllers/notifications.controller.js";

const router = Router();
router.use(authentication);
router.get("/", validate(schemas.paginationQuery), getNotificationsController);
router.patch("/read-all", markAllNotificationsReadController);
router.delete("/read", deleteReadNotificationsController);
router.patch("/:id/read", validate(schemas.id), markNotificationReadController);

export default router;
