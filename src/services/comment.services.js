import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import {updateReport} from "../services/reports.service.js";

const createComment = async (reqportId, employee, data) => {
    const newComment = await pool.query(`insert into comments
                                             (id, text, report_id, admin_id)
                                         values (gen_random_uuid(), $1, $2,
                                                 $3) returning *`, [data.text, reqportId, employee.id]);
    await updateReport(reqportId, employee, {status: "comment"});
    return newComment.rows;

};
const getAllComments = async () => {
    const comments = await pool.query(`SELECT *
                                       FROM comments`);
    return comments.rows;
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
    const result = await pool.query(
        `UPDATE comments
   SET text = $1,
       updated_at = CURRENT_TIMESTAMP
   WHERE id = $2
   RETURNING *`,
        [data.text, id]
    );
    return result.rows;
};
const deleteComment = async (id) => {
    const isExist = await pool.query("SELECT * FROM comments WHERE id = $1", [id]);
    if (isExist.rows.length === 0) {
        throw new ApiError(404, "comment not found")
    }

    const reuslt = await pool.query("DELETE FROM comments WHERE id = $1", [id]);

    return "Comment deleted successfully";
}

export {createComment, getAllComments, getReportComments, updateComment, deleteComment}