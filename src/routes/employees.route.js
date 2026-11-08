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
import { validate, schemas } from "../middlewares/validate.js";

const router = Router();
router.use((req, res, next) => {
    console.log(`ROUTE MATCH employee ${req.method} ${req.originalUrl}`);
    next();
});

router.post("/register", authentication, authorization("admin"), validate(schemas.register), registertionController);
router.get("/", authentication, authorization("admin"), validate(schemas.paginationQuery), getAllEmployeeController)
router.get("/:id", authentication, validate(schemas.id), getEmployeeController);
router.post("/login", validate(schemas.login), loginController);
router.patch("/:id", authentication, validate(schemas.id), validate(schemas.profile), updateEmployeeController);
router.delete("/:id", authentication, validate(schemas.id), deleteEmployeeController);


export default router;
