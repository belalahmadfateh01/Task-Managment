import ApiError from "../utils/ApiError.js";

const authorization = (...allowedRoles) => {
    return (req, res, next) => {

        if (!allowedRoles.includes(req.employee.role)) {
            throw new ApiError(403, "Forbidden");
        }

        next();
    };
};

export default authorization;