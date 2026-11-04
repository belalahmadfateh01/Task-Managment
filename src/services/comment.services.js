import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import {updateReport} from "../services/reports.service.js";

const createComment = async (reportId, employee, data) => {
    const {rows} = await pool.query(`insert into comments
                                             (id, text, report_id, admin_id)
                                         values (gen_random_uuid(), $1, $2,
                                                 $3) returning *`, [data.text, reportId, employee.id]);
    await updateReport(reportId, employee, {status: "comment"});
    return rows;

};
const getAllComments = async () => {
    const {rows} = await pool.query(`SELECT *
                                       FROM comments`);
    return rows;
};
const getReportComments = async (reportId, employee) => {
    const {rows} = await pool.query(`SELECT * FROM reports WHERE id = $1`,[reportId]);

    if (!(employee.id === rows[0].teacher_id || employee.id === rows[0].admin_id)) {
        throw new ApiError(404, "Report not found or you not allowd to view report comments");
    }
    const comments = await pool.query(`SELECT * FROM comments WHERE report_id = $1`, [reportId]);
    return comments.rows;
};
const updateComment = async (id, data) => {
    const isExist = await pool.query("SELECT * FROM comments WHERE id = $1", [id]);
    if (isExist.rows.length === 0) {
        throw new ApiError(404, "comment not found")
    }
    const {rows} = await pool.query(
        `UPDATE comments
   SET text = $1,
       updated_at = CURRENT_TIMESTAMP
   WHERE id = $2
   RETURNING *`,
        [data.text, id]
    );
    return rows;
};
const deleteComment = async (id) => {
    const isExist = await pool.query("SELECT * FROM comments WHERE id = $1", [id]);
    if (isExist.rows.length === 0) {
        throw new ApiError(404, "comment not found")
    }

    await pool.query("DELETE FROM comments WHERE id = $1", [id]);

    return "Comment deleted successfully";
}

export {createComment, getAllComments, getReportComments, updateComment, deleteComment}