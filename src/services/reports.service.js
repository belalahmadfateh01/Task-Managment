import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import {ReportsFilter} from "../utils/apiFeature.js";

const createReport = async (data) => {
    const {rows} = await pool.query(`INSERT INTO reports
                                         (id, status, title, text, file_name, teacher_id)
                                     values (gen_random_uuid(), $1, $2, $3, $4,
                                             $5) returning *`, [data.status, data.title, data.text, data.file_name, data.teacher_id,]);
    return rows[0];
};
const getAllReport = async (queryData) => {
    const {conditions, values} = ReportsFilter(queryData)
    let query = `SELECT r.*,
                        e.f_name,
                        e.l_name,
                        e.user_name,
                        e.email,
                        e.image
                 FROM reports r
                          JOIN employees e
                               ON r.teacher_id = e.id`;
    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`
    }
    const {rows} = await pool.query(query, values)
    return rows;
};
const getReportById = async (id, employee) => {

    const {rows} = await pool.query(`SELECT r.id,
                                             r.title,
                                             r.status,
                                             r.report_date,
                                             r.teacher_id,
                                             e.f_name,
                                             e.l_name,
                                             e.user_name,
                                             r.file_name
                                      FROM reports r
                                               JOIN employees e
                                                    ON r.teacher_id = e.id
                                      WHERE r.id = $1
                                      ORDER BY r.report_date DESC`, [id]);

    if (rows.length === 0) {
        throw new ApiError(400, "Report not found");
    }
    if (!(rows[0].teacher_id === employee.id || employee.role === "admin")) {
        throw new ApiError(404, "Report not found or you are not allowed to get it");
    }
    return rows;
};
const employeeReports = async (id, employee, queryData) => {

    if (!(id === employee.id || employee.role === "admin")) {
        throw new ApiError(403, "You are not allowed to get these reports");
    }

    const {conditions, values} = ReportsFilter(queryData);

    values.push(id);

    let query = `
        SELECT r.id,
               r.title,
               r.status,
               r.report_date,
               r.teacher_id,
               e.f_name,
               e.l_name,
               e.user_name,
               e.image,
               r.file_name
        FROM reports r
                 JOIN employees e
                      ON r.teacher_id = e.id
        WHERE r.teacher_id = $${values.length}
    `;

    if (conditions.length > 0) {
        query += ` AND ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY r.report_date DESC`;

    const {rows} = await pool.query(query, values);

    return rows;
};
const updateReport = async (id, employee, data) => {
    const {rows} = await pool.query("SELECT * FROM reports WHERE id = $1", [id]);
    if (rows.length === 0) {
        throw new ApiError(404, "Report not found or you are not allowed to get it");
    }
    if (employee.role === "admin") {
        const {rows} = await pool.query(`UPDATE reports
                                            SET status     = $1,
                                                admin_id   = $2,
                                                updated_at = CURRENT_TIMESTAMP
                                            WHERE id = $3 RETURNING status`, [data.status, employee.id, id]);
        return rows[0];
    }
    if (employee.id === rows[0].teacher_id) {
        const allowedFields = ["title", "text", "file_name",];

        const fields = Object.keys(data);

        if (fields.length === 0) {
            throw new ApiError(404, "No fields provided for update");
        }

        const invalidFields = fields.filter(field => !allowedFields.includes(field));

        if (invalidFields.length > 0) {
            throw new ApiError(400, "Invalid fields provided");
        }

        const values = Object.values(data);

        const setClause = fields
            .map((field, index) => `${field} = $${index + 1}`)
            .join(", ");

        const query = `
            UPDATE reports
            SET ${setClause}
            WHERE id = $${values.length + 1} RETURNING title, text, file_name
        `;

        const {rows} = await pool.query(query, [...values, id]);

        return rows[0];
    }
};
const reportStats = async () => {
    const {rows} = await pool.query(`SELECT COUNT(*) AS total_reports,
                                               COUNT(*)    FILTER (WHERE status = 'pending') AS pending_reports, COUNT(*) FILTER (WHERE status = 'accept') AS accepted_reports, COUNT(*) FILTER (WHERE status = 'comment') AS comment_reports
                                        FROM reports`);
    return rows;
}
const employeeReportStats = async (id, employee) => {
    if (employee.role !== "admin" && employee.role !== "teacher") {
        throw new ApiError(403, "Access denied");
    }

    if (employee.role === "teacher" && employee.id !== id) {
        throw new ApiError(403, "Access denied");
    }

    const query = `
        SELECT (SELECT COUNT(*)
                FROM reports
                WHERE teacher_id = $1)    AS "totalReports",

               (SELECT COUNT(*)
                FROM reports
                WHERE teacher_id = $1
                  AND status = 'pending') AS "pendingReports",

               (SELECT COUNT(*)
                FROM reports
                WHERE teacher_id = $1
                  AND status = 'accept')  AS "acceptedReports",

               (SELECT COUNT(*)
                FROM reports
                WHERE teacher_id = $1
                  AND status = 'comment') AS "commentedReports"
    `;

    const {rows} = await pool.query(query, [id]);

    return {
        teacherId: id,
        totalReports: Number(rows[0].totalReports),
        pendingReports: Number(rows[0].pendingReports),
        acceptedReports: Number(rows[0].acceptedReports),
        commentedReports: Number(rows[0].commentedReports)
    };
};
const deleteReport = async (id, employee) => {
    if (employee.role !== "admin" && employee.role !== "teacher") {
        throw new ApiError(403, "Access denied");
    }
    const {rows, rowCount} = await pool.query("SELECT id, teacher_id FROM reports WHERE id = $1", [id]);
    if (rowCount === 0) {
        throw new ApiError(404, "Report not found");
    }
    const report = rows[0];

    if (employee.role === "teacher" && report.teacher_id !== employee.id) {
        throw new ApiError(403, "You cannot delete this report");
    }

    await pool.query("DELETE FROM reports WHERE id = $1", [id]);
}

export {
    createReport,
    getAllReport,
    getReportById,
    employeeReports,
    updateReport,
    reportStats,
    employeeReportStats,
    deleteReport
};