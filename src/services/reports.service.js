import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";

const createReport = async (data) => {
    const newReport = await pool.query(`INSERT INTO reports 
    (id, state, title, text, file_name, teacher_id)
    values (gen_random_uuid(), $1, $2, $3, $4, $5)
returning *`,
        [
            data.state,
            data.title,
            data.text,
            data.file_name,
            data.teacher_id,
        ]);
    return newReport.rows[0];
};

const getAllReport = async () => {
    const reports = await pool.query(`SELECT * FROM reports`);
    return reports.rows;
}

const getReportById = async (id) => {
    const reports = await pool.query(`SELECT * FROM reports where id = $1`,[id]);

    if (reports.rows.length === 0) {
        throw new ApiError(400, "report not found");
    }
    return reports.rows;
};

const updateReport = async (data) => {
    const [state, admin_id, report_id] = data
    const newReport = await pool.query(`UPDATE reports SET state = $1, admin_id = $2 WHERE id = $3`,[
        state,admin_id,report_id
    ]);

    return newReport.rows[0];
};

export {createReport, getAllReport, getReportById, updateReport};