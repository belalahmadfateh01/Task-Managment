import {
    deleteEmployee,
    getAllEmployee,
    getEmployee,
    login,
    registertion,
    updateEmployee
} from "../services/employees.service.js";
import catchAsyncError from "../utils/catchAsyncError.js";

const registertionController = catchAsyncError(async (req, res) => {
    const data = req.body;
    const employee = await registertion(data);

    res.status(201).json({
        success: true,
        message: employee
    })
});
const loginController = catchAsyncError(async (req, res) => {
    const token = await login(req.body);
    res.status(200).json({
        success: true,
        message: "login successful",
        token
    })
});
const updateEmployeeController = catchAsyncError(async (req, res) => {
    const employee = await updateEmployee(req.params.id, req.employee.id, req.employee.role, req.body);
    res.status(200).json({
        success: true,
        status: 200,
        message: employee
    })
});
const deleteEmployeeController = catchAsyncError(async (req, res) => {
    console.log(req.params, req.employee.id, req.employee.role);
    const employee = await deleteEmployee(req.params.id, req.employee.id, req.employee.role);
    res.status(200).json({
        success: true,
        status: 200,
        message: employee
    })
});
const getEmployeeController = catchAsyncError(async (req, res) => {
    const employee = await getEmployee(req.params.id, req.employee.id, req.employee.role);

    res.status(200).json({
        success: true,
        status: 200,
        message: employee
    })
})
const getAllEmployeeController = catchAsyncError(async (req, res) => {
    const allEmployee = await getAllEmployee();
    res.status(200).json({
        success: true,
        status: 200,
        message: allEmployee
    });
});

export {
    registertionController,
    loginController,
    updateEmployeeController,
    deleteEmployeeController,
    getAllEmployeeController,
    getEmployeeController
};