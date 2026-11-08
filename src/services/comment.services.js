import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { Pagination } from "../utils/apiFeature.js";
const createComment = async (reportId, employee, data) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const report = await client.query("SELECT id FROM reports WHERE id = $1 FOR UPDATE", [reportId]);
        if (!report.rows[0]) throw new ApiError(404, "Report not found");
        const { rows } = await client.query(
            `INSERT INTO comments (id, text, report_id, admin_id)
             VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *`,
            [data.text, reportId, employee.id]
        );
        await client.query("UPDATE reports SET status = 'comment', admin_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [employee.id, reportId]);
        await client.query("COMMIT");
        return rows[0];
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
    } finally {
        client.release();
    }
};
const getAllComments = async queryData => {
    const { limit, offset } = Pagination(queryData);
    const {rows} = await pool.query("SELECT * FROM comments ORDER BY created_at DESC LIMIT $1 OFFSET $2", [limit, offset]);
    return rows;
};
const getReportComments = async (reportId, employee, queryData) => {
    const {rows} = await pool.query(`SELECT teacher_id FROM reports WHERE id = $1`,[reportId]);
    if (!rows[0]) throw new ApiError(404, "Report not found");
    if (employee.role !== "admin" && employee.id !== rows[0].teacher_id) throw new ApiError(404, "Report not found");
    const { limit, offset } = Pagination(queryData);
    const comments = await pool.query("SELECT * FROM comments WHERE report_id = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3", [reportId, limit, offset]);
    return comments.rows;
};
const updateComment = async (id, data) => {
    const {rows} = await pool.query(
        `UPDATE comments
   SET text = $1,
       updated_at = CURRENT_TIMESTAMP
   WHERE id = $2
   RETURNING *`,
        [data.text, id]
    );
    if (!rows[0]) throw new ApiError(404, "Comment not found");
    return rows;
};
const deleteComment = async (id) => {
    const { rowCount } = await pool.query("DELETE FROM comments WHERE id = $1", [id]);
    if (!rowCount) throw new ApiError(404, "Comment not found");

    return "Comment deleted successfully";
}

export {createComment, getAllComments, getReportComments, updateComment, deleteComment}
