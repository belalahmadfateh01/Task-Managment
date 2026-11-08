
import ApiError from "../utils/ApiError.js";

const ReportsFilter = (queryData) => {
    const allowedStatuses = ["pending", "accept", "comment"];

    const conditions = [];
    const values = [];

    const {
        status,
        startDate,
        endDate,
        user_name,
        title,
        file_name
    } = queryData;

    if (status && !allowedStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const isValidDate = (date) => {
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return false;
        }

        const parsedDate = new Date(`${date}T00:00:00Z`);

        return !Number.isNaN(parsedDate.getTime()) &&
            parsedDate.toISOString().slice(0, 10) === date;
    };

    if (startDate && !isValidDate(startDate)) {
        throw new ApiError(400, "Invalid start date");
    }

    if (endDate && !isValidDate(endDate)) {
        throw new ApiError(400, "Invalid end date");
    }

    if (startDate && endDate && startDate > endDate) {
        throw new ApiError(
            400,
            "Start date cannot be after end date"
        );
    }

    if (status) {
        values.push(status);
        conditions.push(`r.status = $${values.length}`);
    }

    if (startDate) {
        values.push(startDate);
        conditions.push(`r.report_date >= $${values.length}::date`);
    }

    if (endDate) {
        const nextDay = new Date(`${endDate}T00:00:00Z`);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);

        const nextDayString = nextDay.toISOString().slice(0, 10);

        values.push(nextDayString);
        conditions.push(`r.report_date < $${values.length}::date`);
    }

    if (user_name?.trim()) {
        values.push(`%${user_name.trim()}%`);

        conditions.push(`
            (
                e.f_name ILIKE $${values.length}
            OR e.l_name ILIKE $${values.length}
            OR e.user_name ILIKE $${values.length}
            OR e.email ILIKE $${values.length}
            OR CONCAT(e.f_name, ' ', e.l_name) ILIKE $${values.length}
            )
        `);
    }

    if (title?.trim()) {
        values.push(`%${title.trim()}%`);
        conditions.push(`r.title ILIKE $${values.length}`);
    }

    if (file_name?.trim()) {
        values.push(`%${file_name.trim()}%`);
        conditions.push(`r.file_name ILIKE $${values.length}`);
    }

    return { conditions, values };
};

const Pagination = (queryData) => {
    const limit = Number(queryData.limit ?? 25);
    const page = Number(queryData.page ?? 1);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(page) || page < 1) {
        throw new ApiError(400, "page must be a positive integer and limit must be between 1 and 100");
    }
    return { limit, offset: (page - 1) * limit };
};

export { ReportsFilter, Pagination };
