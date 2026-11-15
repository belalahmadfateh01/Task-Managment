import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { Pagination } from "../utils/apiFeature.js";

const getNotifications = async (employee, query) => {
    const { limit, offset } = Pagination(query);
    const { rows } = await pool.query(
        `SELECT id, type, title, body, href, report_id, task_id, created_at, read_at
         FROM notifications
         WHERE employee_id = $1 AND ($2::boolean OR read_at IS NULL)
         ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
        [employee.id, query.includeRead === "true", limit, offset]
    );
    const counts = await pool.query(
        `SELECT COUNT(*)::int AS total_count,
                COUNT(*) FILTER (WHERE read_at IS NULL)::int AS unread_count
         FROM notifications WHERE employee_id = $1`,
        [employee.id]
    );
    return {
        items: rows,
        unreadCount: counts.rows[0].unread_count,
        totalCount: counts.rows[0].total_count,
    };
};

const markNotificationRead = async (id, employee) => {
    const { rows } = await pool.query(
        `UPDATE notifications SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
         WHERE id = $1 AND employee_id = $2 RETURNING id, read_at`,
        [id, employee.id]
    );
    if (!rows[0]) throw new ApiError(404, "Notification not found");
    return rows[0];
};

const markAllNotificationsRead = async employee => {
    const { rowCount } = await pool.query(
        "UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE employee_id = $1 AND read_at IS NULL",
        [employee.id]
    );
    return { updated: rowCount };
};

const deleteReadNotifications = async employee => {
    const { rowCount } = await pool.query(
        "DELETE FROM notifications WHERE employee_id = $1 AND read_at IS NOT NULL",
        [employee.id]
    );
    return { deleted: rowCount };
};

export { getNotifications, markNotificationRead, markAllNotificationsRead, deleteReadNotifications };
