import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";

const reportAccess = async (req, res, next) => {
    try {
        const { rows } = await pool.query("SELECT teacher_id FROM reports WHERE id = $1", [req.params.id]);
        if (!rows[0]) throw new ApiError(404, "Report not found");
        if (req.employee.role !== "admin" && rows[0].teacher_id !== req.employee.id) {
            throw new ApiError(403, "You are not allowed to update this report");
        }
        next();
    } catch (error) {
        next(error);
    }
};

export default reportAccess;
