import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { Pagination } from "../utils/apiFeature.js";

const taskSelect = `
    SELECT t.id, t.title, t.description, t.deadline, t.created_by, t.created_at, t.file_name,
           creator.f_name AS created_by_f_name, creator.l_name AS created_by_l_name,
           COALESCE(
               json_agg(
                   json_build_object(
                       'id', a.id,
                       'teacher_id', a.teacher_id,
                       'teacher_f_name', teacher.f_name,
                       'teacher_l_name', teacher.l_name,
                       'teacher_user_name', teacher.user_name,
                       'status', a.status,
                       'completed_at', a.completed_at
                   ) ORDER BY teacher.f_name, teacher.l_name
               ) FILTER (WHERE a.id IS NOT NULL), '[]'::json
           ) AS assignments
    FROM tasks t
    LEFT JOIN employees creator ON creator.id = t.created_by
    LEFT JOIN task_assignments a ON a.task_id = t.id
    LEFT JOIN employees teacher ON teacher.id = a.teacher_id`;

const createTask = async (adminId, data) => {
    if (!Array.isArray(data.teacher_ids) || data.teacher_ids.length === 0) {
        throw new ApiError(400, "teacher_ids must contain at least one teacher id");
    }
    const teacherIds = [...new Set(data.teacher_ids)];
    if (teacherIds.some(id => typeof id !== "string" || !id.trim())) {
        throw new ApiError(400, "Every teacher id must be a non-empty string");
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const teachers = await client.query(
            "SELECT id FROM employees WHERE id = ANY($1::uuid[]) AND role = 'teacher'",
            [teacherIds]
        );
        if (teachers.rowCount !== teacherIds.length) {
            throw new ApiError(400, "One or more teacher ids are invalid");
        }

        const taskResult = await client.query(
            `INSERT INTO tasks (title, description, deadline, created_by, file_name)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [data.title, data.description ?? null, data.deadline ?? null, adminId, data.file_name ?? null]
        );
        const task = taskResult.rows[0];
        await client.query(
            `INSERT INTO task_assignments (task_id, teacher_id)
             SELECT $1, unnest($2::uuid[])`,
            [task.id, teacherIds]
        );
        await client.query("COMMIT");
        return task;
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
    } finally {
        client.release();
    }
};

const getTasks = async (employee, queryData) => {
    const { limit, offset } = Pagination(queryData);
    let query = `${taskSelect}`;
    const values = [];
    if (employee.role === "teacher") {
        query += " WHERE a.teacher_id = $1";
        values.push(employee.id);
    }
    values.push(limit, offset);
    query += ` GROUP BY t.id, creator.f_name, creator.l_name ORDER BY t.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;
    const { rows } = await pool.query(query, values);
    if (employee.role === "teacher") {
        return rows.map(task => ({
            ...task,
            assignments: task.assignments.filter(assignment => assignment.teacher_id === employee.id)
        }));
    }
    return rows;
};

const getTaskById = async (id, employee) => {
    let query = `${taskSelect} WHERE t.id = $1`;
    const values = [id];
    if (employee.role === "teacher") {
        query += " AND a.teacher_id = $2";
        values.push(employee.id);
    }
    query += " GROUP BY t.id, creator.f_name, creator.l_name";
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) throw new ApiError(404, "Task not found");
    if (employee.role === "teacher") {
        rows[0].assignments = rows[0].assignments.filter(a => a.teacher_id === employee.id);
    }
    return rows[0];
};

const updateTaskStatus = async (taskId, teacherId, status) => {
    if (!["pending", "in_progress", "completed"].includes(status)) {
        throw new ApiError(400, "Invalid task status");
    }
    const { rows } = await pool.query(
        `UPDATE task_assignments
         SET status = $1,
             completed_at = CASE WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END
         WHERE task_id = $2 AND teacher_id = $3
         RETURNING id, task_id, teacher_id, status, completed_at`,
        [status, taskId, teacherId]
    );
    if (rows.length === 0) throw new ApiError(404, "Task assignment not found");
    return rows[0];
};

const updateTask = async (id, data) => {
    const allowedFields = ["title", "description", "deadline", "file_name"];
    const fields = Object.keys(data);
    if (fields.length === 0) throw new ApiError(400, "No fields provided for update");
    if (fields.some(field => !allowedFields.includes(field))) {
        throw new ApiError(400, "Invalid fields provided");
    }
    const values = fields.map(field => data[field]);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
    const { rows } = await pool.query(
        `UPDATE tasks SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`,
        [...values, id]
    );
    if (rows.length === 0) throw new ApiError(404, "Task not found");
    return rows[0];
};

const deleteTask = async id => {
    const { rows } = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING id", [id]);
    if (rows.length === 0) throw new ApiError(404, "Task not found");
    return rows[0];
};

export { createTask, getTasks, getTaskById, updateTaskStatus, updateTask, deleteTask };
