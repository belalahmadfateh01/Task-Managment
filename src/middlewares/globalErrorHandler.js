const globalErrorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err);
    let statusCode = err.statusCode || 500;
    let message = statusCode < 500 ? (err.message || "Request failed") : "Internal Server Error";
    if (statusCode === 500) {
        console.error(err);
    }

    switch (err.code) {
        case "23505":
            statusCode = 409;
            message = "Duplicate value";
            break;

        case "23502":
            statusCode = 400;
            message = "Required field is missing";
            break;

        case "23514":
            statusCode = 400;
            message = "Invalid value";
            break;

        case "22P02":
            statusCode = 400;
            message = "Invalid data format";
            break;

        case "57014":
            statusCode = 503;
            message = "Database query timed out; please retry";
            break;
    }

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
};

export default globalErrorHandler;
