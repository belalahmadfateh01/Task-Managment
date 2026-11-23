import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { Pagination } from "../utils/apiFeature.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { unlink } from "node:fs/promises";

const taskFilesDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../uploads/tasks",
);
const removeStoredTaskFile = async (filePath) => {
  if (!filePath) return;
  const fullPath = path.resolve(taskFilesDirectory, path.basename(filePath));
  if (!fullPath.startsWith(`${taskFilesDirectory}${path.sep}`)) return;
  await unlink(fullPath).catch(() => {});
};

const taskSelect = `
    SELECT t.id, t.title, t.description, t.start_date, t.deadline, t.created_by, t.created_at,
           t.file_name, t.file_path, t.file_size,
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
                       'completed_at', a.completed_at,
                       'response', a.response,
                       'responded_at', a.responded_at,
                       'response_report_id', a.response_report_id
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
  if (teacherIds.some((id) => typeof id !== "string" || !id.trim())) {
    throw new ApiError(400, "Every teacher id must be a non-empty string");
  }
  if (
    data.start_date &&
    data.deadline &&
    new Date(data.start_date) > new Date(data.deadline)
  ) {
    throw new ApiError(400, "Task start date cannot be after its end date");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const teachers = await client.query(
      "SELECT id FROM employees WHERE id = ANY($1::uuid[]) AND role = 'teacher'",
      [teacherIds],
    );
    if (teachers.rowCount !== teacherIds.length) {
      throw new ApiError(400, "One or more teacher ids are invalid");
    }

    const taskResult = await client.query(
      `INSERT INTO tasks (title, description, start_date, deadline, created_by, file_name, file_path, file_size)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        data.title,
        data.description ?? null,
        data.start_date ?? null,
        data.deadline ?? null,
        adminId,
        data.file_name ?? null,
        data.file_path ?? null,
        data.file_size ?? null,
      ],
    );
    const task = taskResult.rows[0];
    await client.query(
      `INSERT INTO task_assignments (task_id, teacher_id)
             SELECT $1, unnest($2::uuid[])`,
      [task.id, teacherIds],
    );
    await client.query(
      `INSERT INTO notifications (employee_id, type, title, body, href, task_id)
            SELECT unnest($1::uuid[]), 'task_assigned', 'وظیفه‌ی تازه به شما واگذار شد', $2, '/employee/tasks', $3`,
      [teacherIds, `وظیفه‌ی «${task.title}» برای شما ثبت شده است.`, task.id],
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
  query += ` GROUP BY t.id, creator.f_name, creator.l_name ORDER BY t.created_at DESC, t.id DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;
  const { rows } = await pool.query(query, values);
  if (employee.role === "teacher") {
    return rows.map((task) => ({
      ...task,
      assignments: task.assignments.filter(
        (assignment) => assignment.teacher_id === employee.id,
      ),
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
    rows[0].assignments = rows[0].assignments.filter(
      (a) => a.teacher_id === employee.id,
    );
  }
  return rows[0];
};

const updateTaskStatus = async (taskId, teacherId, status) => {
  if (!["pending", "in_progress", "completed"].includes(status)) {
    throw new ApiError(400, "Invalid task status");
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const current = await client.query(
      "SELECT id, status FROM task_assignments WHERE task_id = $1 AND teacher_id = $2 FOR UPDATE",
      [taskId, teacherId],
    );
    if (!current.rows[0]) throw new ApiError(404, "Task assignment not found");
    const { rows } = await client.query(
      `UPDATE task_assignments
             SET status = $1,
                 completed_at = CASE WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END
             WHERE task_id = $2 AND teacher_id = $3
             RETURNING id, task_id, teacher_id, status, completed_at`,
      [status, taskId, teacherId],
    );
    if (rows.length === 0) throw new ApiError(404, "Task assignment not found");
    if (current.rows[0].status !== status) {
      const statusLabel = {
        pending: "در انتظار انجام",
        in_progress: "در حال انجام",
        completed: "تکمیل‌شده",
      }[status];
      await client.query(
        `INSERT INTO notifications (employee_id, type, title, body, href, task_id)
                SELECT id, 'task_status', 'وضعیت وظیفه تغییر کرد', $1, '/tasks', $2
                FROM employees WHERE role = 'admin'`,
        [`وضعیت وظیفه به «${statusLabel}» تغییر یافت.`, taskId],
      );
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

const submitTaskResponse = async (taskId, teacherId, response, attachment = null) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: assignedTasks } = await client.query(
      `SELECT a.id, a.response_report_id, r.status AS report_status, t.title AS task_title
             FROM task_assignments a
             JOIN tasks t ON t.id = a.task_id
             LEFT JOIN reports r ON r.id = a.response_report_id
             WHERE a.task_id = $1 AND a.teacher_id = $2
             FOR UPDATE OF a`,
      [taskId, teacherId],
    );
    const assignedTask = assignedTasks[0];
    if (!assignedTask) throw new ApiError(404, "Task assignment not found");

    const reportTitle = `پاسخ فعالیت: ${assignedTask.task_title}`.slice(0, 200);
    const reportText = `فعالیت: ${assignedTask.task_title}\n\nپاسخ کارمند:\n${response.trim()}`;
    let reportId = assignedTask.response_report_id;
    if (reportId && assignedTask.report_status === "pending") {
      await client.query(
        `UPDATE reports
                 SET title = $1, text = $2,
                     file_name = COALESCE($3, file_name), file_path = COALESCE($4, file_path), file_size = COALESCE($5, file_size),
                     updated_at = CURRENT_TIMESTAMP, archived_at = NULL
                 WHERE id = $6`,
        [reportTitle, reportText, attachment?.file_name ?? null, attachment?.file_path ?? null, attachment?.file_size ?? null, reportId],
      );
    } else {
      const { rows: reports } = await client.query(
        `INSERT INTO reports (id, status, title, text, file_name, file_path, file_size, teacher_id)
                 VALUES (gen_random_uuid(), 'pending', $1, $2, $3, $4, $5, $6)
                 RETURNING id`,
        [reportTitle, reportText, attachment?.file_name ?? null, attachment?.file_path ?? null, attachment?.file_size ?? null, teacherId],
      );
      reportId = reports[0].id;
    }

    const { rows } = await client.query(
      `UPDATE task_assignments
             SET response = $1, responded_at = CURRENT_TIMESTAMP, response_report_id = $4,
                 status = 'completed', completed_at = CURRENT_TIMESTAMP
             WHERE task_id = $2 AND teacher_id = $3
             RETURNING id, task_id, teacher_id, response, responded_at, status, completed_at`,
      [response.trim(), taskId, teacherId, reportId],
    );
    await client.query(
      `INSERT INTO notifications (employee_id, type, title, body, href, report_id)
             SELECT id, 'report_submitted', 'پاسخ فعالیت ارسال شد', $1, '/inbox/' || $2::text, $2::uuid
             FROM employees WHERE role = 'admin'`,
      [
        `پاسخ فعالیت «${assignedTask.task_title}» به‌صورت گزارش ارسال شده است.`,
        reportId,
      ],
    );
    await client.query("COMMIT");
    return { ...rows[0], report_id: reportId };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
};

const updateTask = async (id, data) => {
  const allowedFields = [
    "title",
    "description",
    "start_date",
    "deadline",
    "file_name",
    "file_path",
    "file_size",
  ];
  const fields = Object.keys(data);
  if (fields.length === 0)
    throw new ApiError(400, "No fields provided for update");
  if (fields.some((field) => !allowedFields.includes(field))) {
    throw new ApiError(400, "Invalid fields provided");
  }
  const current = await pool.query(
    "SELECT start_date, deadline, file_path FROM tasks WHERE id = $1",
    [id],
  );
  if (!current.rows[0]) throw new ApiError(404, "Task not found");
  const startDate = Object.hasOwn(data, "start_date")
    ? data.start_date
    : current.rows[0].start_date;
  const endDate = Object.hasOwn(data, "deadline")
    ? data.deadline
    : current.rows[0].deadline;
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new ApiError(400, "Task start date cannot be after its end date");
  }
  const values = fields.map((field) => data[field]);
  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");
  const { rows } = await pool.query(
    `UPDATE tasks SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`,
    [...values, id],
  );
  if (rows.length === 0) throw new ApiError(404, "Task not found");
  if (current.rows[0].file_path !== rows[0].file_path) {
    await removeStoredTaskFile(current.rows[0].file_path);
  }
  return rows[0];
};

const deleteTask = async (id) => {
  const client = await pool.connect();
  let task;
  try {
    await client.query("BEGIN");
    await client.query(
      "DELETE FROM notifications WHERE task_id = $1 AND type = 'task_assigned' AND read_at IS NULL",
      [id],
    );
    const { rows } = await client.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING id, file_path",
      [id],
    );
    if (rows.length === 0) throw new ApiError(404, "Task not found");
    task = rows[0];
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
  await removeStoredTaskFile(task.file_path);
  return task;
};

const getTaskAttachment = async (id, employee) => {
  const { rows } = await pool.query(
    `SELECT t.file_name, t.file_path
         FROM tasks t
         LEFT JOIN task_assignments a ON a.task_id = t.id AND a.teacher_id = $3
         WHERE t.id = $1 AND ($2 = 'admin' OR a.teacher_id IS NOT NULL)`,
    [id, employee.role, employee.id],
  );
  if (!rows[0]) throw new ApiError(404, "Task not found");
  if (!rows[0].file_path)
    throw new ApiError(404, "This task has no downloadable attachment");
  return rows[0];
};

export {
  createTask,
  getTasks,
  getTaskById,
  updateTaskStatus,
  submitTaskResponse,
  updateTask,
  deleteTask,
  getTaskAttachment,
};
