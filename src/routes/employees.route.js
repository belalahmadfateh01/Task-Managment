import {Router} from 'express';
import {
    deleteEmployeeController,
    getAllEmployeeController,
    getEmployeeController,
    loginController,
    registertionController,
    updateEmployeeController
} from "../controllers/employees.controller.js";
import authentication from "../middlewares/authentication.js";
import authorization from "../middlewares/authorization.js";

const router = Router();

router.post("/register", authentication, authorization("admin"), registertionController);
router.get("/", authentication, authorization("admin"), getAllEmployeeController)
router.get("/:id", authentication, getEmployeeController);
router.post("/login", loginController);
router.patch("/:id", authentication, updateEmployeeController);
router.delete("/:id", authentication, deleteEmployeeController);


export default router;
