import {
    deleteEmployee,
    getAllEmployee,
    getEmployee,
    login,
    registertion,
    updateEmployee,
    updateProfileImage
} from "../services/employees.service.js";
import catchAsyncError from "../utils/catchAsyncError.js";
import ApiError from "../utils/ApiError.js";
import authCookieOptions from "../utils/authCookie.js";

const registertionController = catchAsyncError(async (req, res) => {
    const data = req.body;
    const employee = await registertion(data);

    res.status(201).json({
        success: true,
        statusCode:201,
        message: employee
    })
});
const loginController = catchAsyncError(async (req, res) => {
    const { token, employee } = await login(req.body);
    res.cookie("access_token", token, authCookieOptions);
    res.status(200).json({
        success: true,
        statusCode:200,
        message: "login successful",
        employee
    })
});
const logoutController = catchAsyncError(async (_req, res) => {
    res.clearCookie("access_token", authCookieOptions);
    res.status(200).json({ success: true, statusCode: 200, message: "logout successful" });
});
const updateEmployeeController = catchAsyncError(async (req, res) => {
    const employee = await updateEmployee(req.params.id, req.employee.id, req.employee.role, req.body);
    res.status(200).json({
        success: true,
        statusCode: 200,
        message: employee
    })
});
const deleteEmployeeController = catchAsyncError(async (req, res) => {
    const employee = await deleteEmployee(req.params.id, req.employee.id, req.employee.role);
    res.status(200).json({
        success: true,
        statusCode: 200,
        message: employee
    })
});
const getEmployeeController = catchAsyncError(async (req, res) => {
    const employee = await getEmployee(req.params.id, req.employee.id, req.employee.role);

    res.status(200).json({
        success: true,
        statusCode: 200,
        message: employee
    })
})
const getAllEmployeeController = catchAsyncError(async (req, res) => {
    const allEmployee = await getAllEmployee(req.query);
    res.status(200).json({
        success: true,
        statusCode: 200,
        message: allEmployee
    });
});
const uploadProfileImageController = catchAsyncError(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Please upload an image");
    }

    const imagePath = `/uploads/profiles/${req.file.filename}`;
    const employeeId = req.params.id ?? req.employee.id;
    if (employeeId !== req.employee.id && req.employee.role !== "admin") {
        throw new ApiError(403, "You are not allowed to update this employee");
    }

    const result = await updateProfileImage(
        employeeId,
        imagePath
    );

    res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Profile image updated successfully",
        data: result.employee
    });
});

export {
    registertionController,
    loginController,
    logoutController,
    updateEmployeeController,
    deleteEmployeeController,
    getAllEmployeeController,
    getEmployeeController,
    uploadProfileImageController
};
