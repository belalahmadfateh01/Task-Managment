import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Pagination } from "../utils/apiFeature.js";

const publicEmployee = ({ password, ...employee }) => employee;

const registertion = async (data) => {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const { rows } = await pool.query(
        `INSERT INTO employees (id, f_name, l_name, user_name, email, password, role, phone, image)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [data.f_name, data.l_name, data.user_name, data.email, hashedPassword, data.role, data.phone ?? null, data.image ?? null]
    );
    return publicEmployee(rows[0]);
};

const login = async (data) => {
    const { rows } = await pool.query("SELECT * FROM employees WHERE email = $1", [data.email]);
    const employee = rows[0];
    if (!employee || !(await bcrypt.compare(data.password, employee.password))) {
        throw new ApiError(401, "Email or Password is incorrect");
    }
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
    const token = jwt.sign({ id: employee.id, role: employee.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "1d"
    });
    return token;
};

const updateEmployee = async (id, userId, role, data) => {
    if (id !== userId && role !== "admin") {
        throw new ApiError(403, "You are not allowed to update this employee");
    }
    const allowedFields = ["f_name", "l_name", "user_name", "email", "phone"];
    const fields = Object.keys(data);
    if (fields.length === 0) throw new ApiError(400, "No fields provided for update");
    if (fields.some(field => !allowedFields.includes(field))) throw new ApiError(400, "Invalid fields provided");
    const values = fields.map(field => data[field]);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
    const { rows } = await pool.query(
        `UPDATE employees SET ${setClause} WHERE id = $${values.length + 1} RETURNING id, f_name, l_name, user_name, email, phone, role, image`,
        [...values, id]
    );
    if (!rows[0]) throw new ApiError(404, "Employee not found");
    return rows[0];
};

const deleteEmployee = async (id, userId, role) => {
    if (id !== userId && role !== "admin") throw new ApiError(403, "You are not allowed to delete this employee");
    const { rows } = await pool.query("DELETE FROM employees WHERE id = $1 RETURNING id, f_name, l_name, user_name, email, role", [id]);
    if (!rows[0]) throw new ApiError(404, "Employee not found");
    return rows[0];
};

const getEmployee = async (id, userId, role) => {
    if (id !== userId && role !== "admin") throw new ApiError(403, "You are not allowed to view this employee");
    const { rows } = await pool.query("SELECT id, f_name, l_name, user_name, email, phone, role, image FROM employees WHERE id = $1", [id]);
    if (!rows[0]) throw new ApiError(404, "Employee not found");
    return rows[0];
};

const getAllEmployee = async queryData => {
    const { limit, offset } = Pagination(queryData);
    const { rows } = await pool.query(
        `SELECT id, f_name, l_name, user_name, email, phone, role, image
         FROM employees ORDER BY f_name, l_name LIMIT $1 OFFSET $2`,
        [limit, offset]
    );
    return rows;
};

export { registertion, login, updateEmployee, deleteEmployee, getEmployee, getAllEmployee };
