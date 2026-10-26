import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";

const createReport = async (data) => {
    const newReport = await pool.query(`INSERT INTO reports
                                            (id, state, title, text, file_name, teacher_id)
                                        values (gen_random_uuid(), $1, $2, $3, $4,
                                                $5) returning *`, [data.state, data.title, data.text, data.file_name, data.teacher_id,]);
    return newReport.rows[0];
};
const getAllReport = async () => {
    const reports = await pool.query(`SELECT *
                                      FROM reports`);
    return reports.rows;
};
const getReportById = async (id, userId, role) => {
    const reports = await pool.query(`SELECT *
                                      FROM reports
                                      where id = $1`, [id]);

    if (reports.rows.length === 0) {
        throw new ApiError(400, "Report not found");
    }
    if (!(reports.rows.teacher_id === userId || role === "admin")) {
        throw new ApiError(404, "Report not found or you are not allowed to get it");
    }
    return reports.rows;
};
const employeeReports = async (id, userId, role) => {
    if (!(id === userId || role === "admin")) {
        throw new ApiError(404, "Report not found or you are not allowed to get it");
    }
    const reports = await pool.query("SELECT * FROM reports where teacher_id = $1", [id]);
    return reports.rows;
};
const updateReport = async (id, employee, data) => {
    const reports = await pool.query("SELECT * FROM reports WHERE id = $1", [id]);
    if (reports.rows.length === 0) {
        throw new ApiError(404, "Report not found or you are not allowed to get it");
    }
    if (employee.role === "admin") {
        const newReport = await pool.query(`UPDATE reports
                                            SET state    = $1,
                                                admin_id = $2
                                            WHERE id = $3 RETURNING state`, [data.state, employee.id, id]);
        return newReport.rows[0];
    }
    if (employee.userId === reports.rows.teacher_id) {
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

        const report = await pool.query(query, [...values, id]);

        return report.rows[0];
    }
};
const reportStats = async () => {
    const allReport = await pool.query(`SELECT COUNT(*) AS total_reports,
                                               COUNT(*)    FILTER (WHERE status = 'pending') AS pending_reports, COUNT(*) FILTER (WHERE status = 'accept') AS accepted_reports
                                        FROM reports`);
    return allReport.rows;
}
const employeeReportStats = async (id, employee) => {
    // Check authorization
    if (employee.role !== "admin" && employee.role !== "teacher") {
        throw new ApiError(403, "Access denied");
    }

    // A teacher can only see their own statistics
    if (employee.role === "teacher" && employee.id !== teacherId) {
        throw new ApiError(403, "Access denied");
    }

    const query = `
        SELECT (SELECT COUNT(*)
                FROM reports
                WHERE teacher_id = $1)    AS "totalReports",

               (SE-ahmad01
                   LECT COUNT(*)
                FROM comments c
                         JOIN reports r ON r.id = c.report_id
                WHERE r.teacher_id = $1)  AS "totalComments",

               (SELECT COUNT(*)
                FROM reports
                WHERE teacher_id = $1
                  AND status = 'pending') AS "pendingReports",

               (SELECT COUNT(*)
                FROM reports
                WHERE teacher_id = $1
                  AND status = 'accept')  AS "acceptedReports"
    `;

    const {rows} = await pool.query(query, [teacherId]);

    return {
        teacherId,
        totalReports: Number(rows[0].totalReports),
        totalComments: Number(rows[0].totalComments),
        pendingReports: Number(rows[0].pendingReports),
        acceptedReports: Number(rows[0].acceptedReports),
    };
};
const deleteReport = async (id, employee) => {
    if (employee.role !== "admin" && employee.role !== "teacher") {
        throw new ApiError(403, "Access denied");
    }
    const result = await pool.query(
        "SELECT id, teacher_id FROM reports WHERE id = $1",
        [id]
    );
    if (result.rowCount === 0) {
        throw new ApiError(404, "Report not found");
    }
    const report = result.rows[0];

    if (
        employee.role === "teacher" &&
        report.teacher_id !== employee.id
    ) {
        throw new ApiError(403, "You cannot delete this report");
    }

    await pool.query(
        "DELETE FROM reports WHERE id = $1",
        [id]
    );
}

export {createReport, getAllReport, getReportById, employeeReports, updateReport, reportStats, employeeReportStats, deleteReport};