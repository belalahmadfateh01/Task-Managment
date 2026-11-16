import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Pagination } from "../utils/apiFeature.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { unlink } from "node:fs/promises";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const profileImagesDirectory = path.resolve(currentDirectory, "../../uploads/profiles");
const reportFilesDirectory = path.resolve(currentDirectory, "../../uploads/reports");
const removeFileFrom = async (directory, filename) => {
    if (!filename) return;
    const fullPath = path.resolve(directory, path.basename(filename));
    if (!fullPath.startsWith(`${directory}${path.sep}`)) return;
    await unlink(fullPath).catch(() => {});
};
const removeProfileImage = imagePath => {
    if (!imagePath?.startsWith("/uploads/profiles/")) return Promise.resolve();
    return removeFileFrom(profileImagesDirectory, imagePath);
};
const removeReportFile = filePath => removeFileFrom(reportFilesDirectory, filePath);

const publicEmployee = ({ password, ...employee }) => employee;

const registertion = async (data) => {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const { rows } = await pool.query(
        `INSERT INTO employees (id, f_name, l_name, user_name, email, password, role, phone, image, address)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [data.f_name.trim(), data.l_name.trim(), data.user_name.trim(), data.email.trim().toLowerCase(), hashedPassword, data.role, data.phone?.trim() || null, data.image ?? null, data.address?.trim() || null]
    );
    return publicEmployee(rows[0]);
};

const login = async (data) => {
    const { rows } = await pool.query("SELECT * FROM employees WHERE lower(email) = $1", [data.email.trim().toLowerCase()]);
    const employee = rows[0];
    if (!employee || !(await bcrypt.compare(data.password, employee.password))) {
        throw new ApiError(401, "Email or Password is incorrect");
    }
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
    await pool.query("UPDATE employees SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1", [employee.id]);
    const token = jwt.sign({ id: employee.id, role: employee.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "1d"
    });
    return { token, employee: { id: employee.id, role: employee.role } };
};

const updateEmployee = async (id, userId, role, data) => {
    if (id !== userId && role !== "admin") {
        throw new ApiError(403, "You are not allowed to update this employee");
    }
    const allowedFields = ["f_name", "l_name", "user_name", "email", "phone", "address"];
    const fields = Object.keys(data);
    if (fields.length === 0) throw new ApiError(400, "No fields provided for update");
    if (fields.some(field => !allowedFields.includes(field))) throw new ApiError(400, "Invalid fields provided");
    const values = fields.map(field => {
        const value = data[field];
        if (typeof value !== "string") return value;
        const normalized = value.trim();
        return field === "email" ? normalized.toLowerCase() : normalized || null;
    });
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
    const { rows } = await pool.query(
        `UPDATE employees SET ${setClause} WHERE id = $${values.length + 1} RETURNING id, f_name, l_name, user_name, email, phone, role, image, address`,
        [...values, id]
    );
    if (!rows[0]) throw new ApiError(404, "Employee not found");
    return rows[0];
};

const deleteEmployee = async (id, userId, role) => {
    if (role !== "admin") throw new ApiError(403, "Only administrators may delete employees");
    const client = await pool.connect();
    let image;
    let reportFiles = [];
    try {
        await client.query("BEGIN");
        const employee = await client.query("SELECT id, role, image FROM employees WHERE id = $1 FOR UPDATE", [id]);
        if (!employee.rows[0]) throw new ApiError(404, "Employee not found");
        if (employee.rows[0].role !== "teacher") throw new ApiError(400, "Administrator accounts cannot be deleted here");
        image = employee.rows[0].image;
        const reports = await client.query(
            "SELECT id, file_path FROM reports WHERE teacher_id = $1",
            [id]
        );
        const reportIds = reports.rows.map(row => row.id);
        reportFiles = reports.rows.map(row => row.file_path).filter(Boolean);

        // Remove dependent rows explicitly so deletion also works with databases
        // created before the current ON DELETE CASCADE rules were introduced.
        await client.query(`UPDATE notifications SET href = NULL, report_id = NULL
            WHERE report_id = ANY($1::uuid[])`, [reportIds]);
        await client.query("DELETE FROM report_reads WHERE employee_id = $1 OR report_id = ANY($2::uuid[])", [id, reportIds]);
        await client.query("DELETE FROM comments WHERE admin_id = $1 OR report_id = ANY($2::uuid[])", [id, reportIds]);
        await client.query("DELETE FROM reports WHERE teacher_id = $1", [id]);
        await client.query("DELETE FROM task_assignments WHERE teacher_id = $1", [id]);
        await client.query("UPDATE reports SET admin_id = NULL WHERE admin_id = $1", [id]);
        await client.query("UPDATE tasks SET created_by = NULL WHERE created_by = $1", [id]);
        await client.query("DELETE FROM notifications WHERE employee_id = $1", [id]);
        const { rows } = await client.query("DELETE FROM employees WHERE id = $1 RETURNING id, f_name, l_name, user_name, email, role", [id]);
        await client.query("COMMIT");
        await removeProfileImage(image);
        for (const filePath of reportFiles) await removeReportFile(filePath);
        return rows[0];
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
    } finally {
        client.release();
    }
};

const getEmployee = async (id, userId, role) => {
    if (id !== userId && role !== "admin") throw new ApiError(403, "You are not allowed to view this employee");
    const { rows } = await pool.query("SELECT id, f_name, l_name, user_name, email, phone, role, image, address, created_at, last_login_at FROM employees WHERE id = $1", [id]);
    if (!rows[0]) throw new ApiError(404, "Employee not found");
    return rows[0];
};

const getAllEmployee = async queryData => {
    const { limit, offset } = Pagination(queryData);
    const { rows } = await pool.query(
        `SELECT id, f_name, l_name, user_name, email, phone, role, image, address, created_at, last_login_at
         FROM employees WHERE role = 'teacher' ORDER BY f_name, l_name, id LIMIT $1 OFFSET $2`,
        [limit, offset]
    );
    return rows;
};

const updateProfileImage = async (userId, imagePath) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Get current image and lock employee row
        const { rows } = await client.query(
            "SELECT image FROM employees WHERE id = $1 FOR UPDATE",
            [userId]
        );

        if (!rows[0]) {
            throw new ApiError(404, "Employee not found");
        }

        const previousImage = rows[0].image;

        // Update profile image
        const { rows: updatedRows } = await client.query(
            `UPDATE employees
             SET image = $1
             WHERE id = $2
             RETURNING id, f_name, l_name, user_name, email, role, image, address`,
            [imagePath, userId]
        );

        await client.query("COMMIT");

        if (previousImage !== imagePath) await removeProfileImage(previousImage);

        return {
            employee: updatedRows[0],
            previousImage
        };

    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        await removeProfileImage(imagePath);
        throw error;

    } finally {
        client.release();
    }
};


export { registertion, login, updateEmployee, deleteEmployee, getEmployee, getAllEmployee, updateProfileImage };
