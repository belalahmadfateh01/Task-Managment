import ApiError from "../utils/ApiError.js";

const validate = (schema) => (req, res, next) => {
    const errors = schema(req);
    if (errors.length) return next(new ApiError(400, errors.join("; ")));
    next();
};

const requiredText = (value, field, { min = 1, max = 255 } = {}) => {
    if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) {
        return `${field} must be ${min}-${max} characters`;
    }
    return null;
};

const emailError = value => typeof value !== "string" || value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ? "email must be valid" : null;

const uuidError = (value, field) => typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? `${field} must be a UUID` : null;

const schemas = {
    login: req => [emailError(req.body.email), requiredText(req.body.password, "password", { max: 128 })].filter(Boolean),
    register: req => {
        const errors = [requiredText(req.body.f_name, "f_name"), requiredText(req.body.l_name, "l_name"), requiredText(req.body.user_name, "user_name"), emailError(req.body.email), requiredText(req.body.password, "password", { min: 8, max: 128 })].filter(Boolean);
        if (req.body.role !== "teacher") errors.push("role must be teacher");
        if (req.body.phone != null && (typeof req.body.phone !== "string" || req.body.phone.length > 32)) errors.push("phone must be at most 32 characters");
        return errors;
    },
    profile: req => {
        const allowed = ["f_name", "l_name", "user_name", "email", "phone"];
        const fields = Object.keys(req.body);
        const errors = [];
        if (!fields.length) errors.push("At least one profile field is required");
        if (fields.some(field => !allowed.includes(field))) errors.push("Only profile fields can be updated");
        if ("email" in req.body) errors.push(emailError(req.body.email));
        for (const field of ["f_name", "l_name", "user_name"]) if (field in req.body) errors.push(requiredText(req.body[field], field));
        if ("phone" in req.body && req.body.phone != null && (typeof req.body.phone !== "string" || req.body.phone.length > 32)) errors.push("phone must be at most 32 characters");
        return errors.filter(Boolean);
    },
    report: req => {
        const errors = [requiredText(req.body.title, "title", { max: 200 }), requiredText(req.body.text, "text", { max: 20000 })].filter(Boolean);
        if (req.body.file_name != null && (typeof req.body.file_name !== "string" || req.body.file_name.length > 512)) errors.push("file_name must be at most 512 characters");
        return errors;
    },
    reportUpdate: req => {
        const fields = Object.keys(req.body);
        const allowed = req.employee?.role === "admin" ? ["status"] : ["title", "text", "file_name"];
        const errors = [];
        if (!fields.length) errors.push("At least one field is required");
        if (fields.some(field => !allowed.includes(field))) errors.push("Invalid fields provided");
        if ("status" in req.body && !["pending", "accept", "comment"].includes(req.body.status)) errors.push("Invalid status");
        if ("title" in req.body) errors.push(requiredText(req.body.title, "title", { max: 200 }));
        if ("text" in req.body) errors.push(requiredText(req.body.text, "text", { max: 20000 }));
        if ("file_name" in req.body && req.body.file_name != null && (typeof req.body.file_name !== "string" || req.body.file_name.length > 512)) errors.push("file_name must be at most 512 characters");
        return errors.filter(Boolean);
    },
    comment: req => [requiredText(req.body.text, "text", { max: 10000 })].filter(Boolean),
    task: req => {
        const errors = [requiredText(req.body.title, "title", { max: 200 })].filter(Boolean);
        if (!Array.isArray(req.body.teacher_ids) || req.body.teacher_ids.length < 1 || req.body.teacher_ids.length > 500) errors.push("teacher_ids must contain 1-500 teacher ids");
        else errors.push(...req.body.teacher_ids.map(id => uuidError(id, "teacher_id")).filter(Boolean));
        if (req.body.description != null && (typeof req.body.description !== "string" || req.body.description.length > 20000)) errors.push("description must be at most 20000 characters");
        if (req.body.deadline != null && (typeof req.body.deadline !== "string" || Number.isNaN(Date.parse(req.body.deadline)))) errors.push("deadline must be a valid date");
        if (req.body.file_name != null && (typeof req.body.file_name !== "string" || req.body.file_name.length > 512)) errors.push("file_name must be at most 512 characters");
        return errors;
    },
    taskUpdate: req => {
        const allowed = ["title", "description", "deadline", "file_name"];
        const fields = Object.keys(req.body);
        const errors = [];
        if (!fields.length) errors.push("At least one field is required");
        if (fields.some(field => !allowed.includes(field))) errors.push("Invalid fields provided");
        if ("title" in req.body) errors.push(requiredText(req.body.title, "title", { max: 200 }));
        if ("description" in req.body && req.body.description != null && (typeof req.body.description !== "string" || req.body.description.length > 20000)) errors.push("description must be at most 20000 characters");
        if ("deadline" in req.body && req.body.deadline != null && (typeof req.body.deadline !== "string" || Number.isNaN(Date.parse(req.body.deadline)))) errors.push("deadline must be a valid date");
        if ("file_name" in req.body && req.body.file_name != null && (typeof req.body.file_name !== "string" || req.body.file_name.length > 512)) errors.push("file_name must be at most 512 characters");
        return errors.filter(Boolean);
    },
    taskStatus: req => [["pending", "in_progress", "completed"].includes(req.body.status) ? null : "Invalid task status"].filter(Boolean),
    id: req => [uuidError(req.params.id, "id")].filter(Boolean),
    reportId: req => [uuidError(req.params.reportId, "reportId")].filter(Boolean),
    teacherId: req => [uuidError(req.params.teacherId, "teacherId")].filter(Boolean),
    reportQuery: req => {
        const scalarKeys = ["status", "startDate", "endDate", "user_name", "title", "file_name", "page", "limit"];
        return scalarKeys.filter(key => req.query[key] !== undefined && typeof req.query[key] !== "string").map(key => `${key} must be a single value`);
    },
    paginationQuery: req => ["page", "limit"].filter(key => req.query[key] !== undefined && typeof req.query[key] !== "string").map(key => `${key} must be a single value`)
};

export { validate, schemas };
