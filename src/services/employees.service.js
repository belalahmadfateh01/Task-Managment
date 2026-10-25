import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registertion = async (data) => {
    const employee = await pool.query(`select * from employees where email = $1`,[data.email]);
    if (employee.rows.length > 0) {
        throw new ApiError(409, "Teacher already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newEmployee = await pool.query(`insert into employees 
    (id, f_name, l_name, user_name, email, password, role, phone, image)
    values (gen_random_uuid(),$1, $2, $3, $4, $5, $6, $7, $8)
    returning *`,
        [
            data.f_name,
            data.l_name,
            data.user_name,
            data.email,
            hashedPassword,
            data.role,
            data.phone,
            data.image
        ]
        )
    const newEmployeeObject = newEmployee.rows[0];
    delete newEmployeeObject.password;
    return newEmployeeObject;
};
const login = async (data) => {
    const employee = await pool.query(`SELECT * FROM employees WHERE email = $1`,[data.email]);
    if (employee.rows.length === 0) {
        throw new ApiError(401, "Email or Password is incorrect");
    }
    const employee1 = employee.rows[0];
    const isPasswordCorrect = await bcrypt.compare(data.password, employee1.password)
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Email or Password is incorrect");
    }
    const token = jwt.sign(
        {
            id: employee1.id,
            role: employee1.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE
        }
    );
    return token;

}
const updateEmployee = async (id, userId, role, data) => {
    if (!(id === userId)) {
        throw new ApiError(404, "Record not found or you are not allowed to update it");
    }
    let employee = await pool.query("select * from employees where id = $1", [id]);
    const comparePassword = await bcrypt.compare(data.password, employee.rows.password);

    const allowedFields = [
        "f_name",
        "l_name",
        "user_name",
        "email",
        "phone"
    ];

    const fields = Object.keys(data);

    if (fields.length === 0) {
        throw new Error("No fields provided for update");
    }

    const invalidFields = fields.filter(
        field => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
        throw new Error("Invalid fields provided");
    }

    const values = Object.values(data);

    const setClause = fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");

    const query = `
        UPDATE employees
        SET ${setClause}
        WHERE id = $${values.length + 1}
        RETURNING id, f_name, l_name, user_name, email, phone
    `;

    employee = await pool.query(query, [...values, id]);

    return employee.rows[0];
};
const deleteEmployee = async (id, userId, role) => {
    if (!(id === userId || role === "admin")) {
        throw new ApiError(404, "Record not found or you are not allowed to delete it");
    }

    const result = await pool.query(
        "DELETE FROM employees WHERE id = $1 RETURNING *",
        [id]
    );
    const newResult = Object(result.rows[0]);
    delete newResult.password;
    return result.rows[0];
}
const getEmployee = async (id, userId, role) => {
    if (!(id === userId || role === "admin")) {
        throw new ApiError(404, "Record not found or you are not allowed to delete it");
    }
    const employee = await pool.query("SELECT * FROM employees WHERE id = $1", [id]);
    const employeeObject =  Object(employee.rows[0]);
    delete employeeObject.password;
    return employeeObject;
};
const getAllEmployee = async () => {
    const employees = await pool.query("select * from employees");
    const employeesObject = Object(employees.rows);
    employeesObject.forEach(employee => {
        delete employee.password
    })
    return employeesObject;
}

export { registertion, login, updateEmployee, deleteEmployee, getEmployee, getAllEmployee};
