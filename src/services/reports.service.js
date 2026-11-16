import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import {ReportsFilter, Pagination} from "../utils/apiFeature.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { unlink } from "node:fs/promises";

const reportFilesDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads/reports");
const removeStoredFile = async filePath => {
    if (!filePath) return;
    const fullPath = path.resolve(reportFilesDirectory, path.basename(filePath));
    if (!fullPath.startsWith(`${reportFilesDirectory}${path.sep}`)) return;
    await unlink(fullPath).catch(() => {});
};

const createReport = async (data) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const { rows } = await client.query(`INSERT INTO reports
            (id, status, title, text, file_name, file_path, file_size, teacher_id)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [data.status ?? "pending", data.title, data.text, data.file_name ?? null, data.file_path ?? null, data.file_size ?? null, data.teacher_id]);
        if (rows[0].status === "pending") {
            await client.query(`INSERT INTO notifications (employee_id, type, title, body, href, report_id)
                SELECT id, 'report_submitted', 'گزارش تازه دریافت شد', $1, '/inbox/' || $2::text, $2::uuid
                FROM employees WHERE role = 'admin'`,
            [`گزارش «${data.title}» ارسال شده است.`, rows[0].id]);
        }
        await client.query("COMMIT");
        return rows[0];
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
    } finally {
        client.release();
    }
};
const getAllReport = async (queryData, employee) => {
    const {conditions, values} = ReportsFilter(queryData)
    const {limit, offset} = Pagination(queryData);
    let query = `SELECT r.*,
                        e.f_name,
                        e.l_name,
                        e.user_name,
                        e.email,
                        e.image,
                        (SELECT c.text
                         FROM comments c
                         WHERE c.report_id = r.id
                         ORDER BY c.created_at DESC
                         LIMIT 1) AS comment_text,
                        rr.read_at
                 FROM reports r
                          JOIN employees e
                               ON r.teacher_id = e.id
                          LEFT JOIN report_reads rr
                               ON rr.report_id = r.id AND rr.employee_id = $${values.length + 1}`;
    values.push(employee.id);
    if (!queryData.status) {
        conditions.push("r.status <> 'draft'");
    }
    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`
    }
    values.push(limit, offset);
    query += ` ORDER BY r.report_date DESC, r.id DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;
    const {rows} = await pool.query(query, values)
    return rows;
};
const getReportById = async (id, employee) => {

    const {rows} = await pool.query(`SELECT r.id,
                                             r.title,
                                             r.status,
                                             r.report_date,
                                             r.updated_at,
                                             r.text,
                                             r.teacher_id,
                                             e.f_name,
                                             e.l_name,
                                             e.user_name,
                                             r.file_name,
                                             r.file_path,
                                             r.file_size,
                                             r.archived_at,
                                             rr.read_at,
                                             (SELECT c.text FROM comments c WHERE c.report_id = r.id ORDER BY c.created_at DESC LIMIT 1) AS comment_text
                                      FROM reports r
                                               JOIN employees e
                                                    ON r.teacher_id = e.id
                                               LEFT JOIN report_reads rr
                                                    ON rr.report_id = r.id AND rr.employee_id = $2
                                      WHERE r.id = $1
                                      ORDER BY r.report_date DESC`, [id, employee.id]);

    if (rows.length === 0) throw new ApiError(404, "Report not found");
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
    const {limit, offset} = Pagination(queryData);

    values.push(id);

    let query = `
        SELECT r.id,
               r.title,
               r.status,
               r.report_date,
               r.updated_at,
               r.text,
               r.teacher_id,
               e.f_name,
               e.l_name,
               e.user_name,
               e.image,
               r.file_name,
               r.file_path,
               r.file_size,
               (SELECT c.text
                FROM comments c
                WHERE c.report_id = r.id
                ORDER BY c.created_at DESC
                LIMIT 1) AS comment_text
        FROM reports r
                 JOIN employees e
                      ON r.teacher_id = e.id
        WHERE r.teacher_id = $${values.length}
    `;

    if (conditions.length > 0) {
        query += ` AND ${conditions.join(" AND ")}`;
    }

    values.push(limit, offset);
    query += ` ORDER BY r.report_date DESC, r.id DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;

    const {rows} = await pool.query(query, values);

    return rows;
};
const updateReport = async (id, employee, data) => {
    const fields = Object.keys(data);
    if (fields.length === 0) throw new ApiError(400, "No fields provided for update");

    const client = await pool.connect();
    let previousFilePath;
    let updatedReport;
    try {
        await client.query("BEGIN");
        const linkedTasksResult = employee.role === "admin" && data.status === "comment"
            ? await client.query(
                `SELECT a.id, a.task_id, a.teacher_id, a.status, t.title AS task_title
                 FROM task_assignments a
                 JOIN tasks t ON t.id = a.task_id
                 WHERE a.response_report_id = $1
                 FOR UPDATE OF a`,
                [id]
            )
            : { rows: [] };
        const currentResult = await client.query(
            "SELECT id, status, teacher_id, file_path, title FROM reports WHERE id = $1 FOR UPDATE",
            [id]
        );
        const current = currentResult.rows[0];
        if (!current) throw new ApiError(404, "Report not found");

        if (employee.role === "admin") {
            if (fields.length !== 1 || !fields.includes("status") || !["pending", "accept", "comment"].includes(data.status)) {
                throw new ApiError(400, "Admin must provide a valid report status");
            }

            const { rows } = await client.query(`UPDATE reports
                SET status = $1, admin_id = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $3 RETURNING status, teacher_id, title`, [data.status, employee.id, id]);
            updatedReport = rows[0];

            if (current.status !== updatedReport.status) {
                await client.query(`INSERT INTO notifications (employee_id, type, title, body, href, report_id)
                    VALUES ($1, 'report_reviewed', $2, $3, $4, $5)`, [
                    updatedReport.teacher_id,
                    data.status === "accept" ? "گزارش شما تأیید شد" : data.status === "comment" ? "برای گزارش شما بازخورد ثبت شد" : "وضعیت گزارش شما تغییر کرد",
                    `وضعیت گزارش «${updatedReport.title}» به‌روزرسانی شد.`,
                    `/employee/reports/${id}`,
                    id,
                ]);
            }

            if (data.status === "comment" && current.status !== "comment") {
                for (const assignment of linkedTasksResult.rows) {
                    if (assignment.status !== "completed") continue;
                    await client.query(
                        `UPDATE task_assignments
                         SET status = 'pending', completed_at = NULL
                         WHERE id = $1`,
                        [assignment.id]
                    );
                    await client.query(
                        `INSERT INTO notifications (employee_id, type, title, body, href, task_id)
                         VALUES ($1, 'task_reopened', 'فعالیت برای اصلاح بازگشایی شد', $2, '/employee/tasks', $3)`,
                        [
                            assignment.teacher_id,
                            `گزارش فعالیت «${assignment.task_title}» رد شد. لطفاً اصلاحات لازم را انجام دهید و دوباره ارسال کنید.`,
                            assignment.task_id,
                        ]
                    );
                }
            }
        } else {
            if (employee.role !== "teacher" || employee.id !== current.teacher_id) {
                throw new ApiError(403, "You are not allowed to update this report");
            }

            const allowedFields = ["title", "text", "file_name", "file_path", "file_size", "status"];
            if (fields.some(field => !allowedFields.includes(field))) {
                throw new ApiError(400, "Invalid fields provided");
            }
            if (!["draft", "comment"].includes(current.status)) {
                throw new ApiError(400, "This report is no longer editable");
            }

            if (data.status) {
                const canSaveDraft = data.status === "draft";
                const canSubmit = data.status === "pending";
                if (!canSaveDraft && !canSubmit) {
                    throw new ApiError(400, "This report cannot change to the requested status");
                }
            }

            const values = Object.values(data);
            const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
            values.push(id);
            const { rows } = await client.query(`UPDATE reports
                SET ${setClause}, updated_at = CURRENT_TIMESTAMP
                WHERE id = $${values.length} RETURNING id, title, text, file_name, file_path, file_size, status`, values);
            updatedReport = rows[0];

            if (data.status === "pending" && current.status !== "pending") {
                await client.query(`INSERT INTO notifications (employee_id, type, title, body, href, report_id)
                    SELECT id, 'report_submitted', 'گزارش تازه دریافت شد', $1, $2, $3
                    FROM employees WHERE role = 'admin'`,
                [`گزارش «${updatedReport.title}» برای بررسی ارسال شده است.`, `/inbox/${id}`, id]);
            }
            previousFilePath = current.file_path !== updatedReport.file_path ? current.file_path : null;
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
    } finally {
        client.release();
    }

    if (previousFilePath) await removeStoredFile(previousFilePath);
    return updatedReport;
};
const reportStats = async () => {
    const {rows} = await pool.query(`SELECT COUNT(*) FILTER (WHERE status <> 'draft') AS total_reports,
                                               COUNT(*) FILTER (WHERE status = 'pending') AS pending_reports, COUNT(*) FILTER (WHERE status = 'accept') AS accepted_reports, COUNT(*) FILTER (WHERE status = 'comment') AS comment_reports
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
    const client = await pool.connect();
    let filePath;
    try {
        await client.query("BEGIN");
        const { rows } = await client.query("SELECT id, teacher_id, file_path FROM reports WHERE id = $1 FOR UPDATE", [id]);
        if (!rows[0]) throw new ApiError(404, "Report not found");
        if (employee.role === "teacher" && rows[0].teacher_id !== employee.id) {
            throw new ApiError(403, "You cannot delete this report");
        }
        filePath = rows[0].file_path;
        await client.query("UPDATE notifications SET href = NULL, report_id = NULL WHERE report_id = $1", [id]);
        await client.query("DELETE FROM reports WHERE id = $1", [id]);
        await client.query("COMMIT");
        await removeStoredFile(filePath);
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
    } finally {
        client.release();
    }
}

const getReportAttachment = async (id, employee) => {
    const { rows } = await pool.query(
        "SELECT teacher_id, file_name, file_path FROM reports WHERE id = $1",
        [id]
    );
    if (!rows[0]) throw new ApiError(404, "Report not found");
    if (employee.role !== "admin" && rows[0].teacher_id !== employee.id) {
        throw new ApiError(404, "Report not found");
    }
    if (!rows[0].file_path) throw new ApiError(404, "This report has no downloadable attachment");
    return rows[0];
};

const archiveReport = async (id, archived) => {
    const { rows } = await pool.query(
        `UPDATE reports SET archived_at = CASE WHEN $2::boolean THEN COALESCE(archived_at, CURRENT_TIMESTAMP) ELSE NULL END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND status <> 'draft'
         RETURNING id, archived_at`,
        [id, archived]
    );
    if (!rows[0]) throw new ApiError(404, "Report not found");
    return rows[0];
};

const markReportRead = async (id, employee) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const report = await client.query("SELECT id FROM reports WHERE id = $1 AND status <> 'draft' FOR UPDATE", [id]);
        if (!report.rows[0]) throw new ApiError(404, "Report not found");
        const { rows } = await client.query(
            `INSERT INTO report_reads (report_id, employee_id)
             VALUES ($1, $2)
             ON CONFLICT (report_id, employee_id) DO UPDATE SET read_at = EXCLUDED.read_at
             RETURNING read_at`,
            [id, employee.id]
        );
        await client.query("COMMIT");
        return rows[0];
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
    } finally {
        client.release();
    }
};

export {
    createReport,
    getAllReport,
    getReportById,
    employeeReports,
    updateReport,
    reportStats,
    employeeReportStats,
    deleteReport,
    getReportAttachment,
    archiveReport,
    markReportRead
};
