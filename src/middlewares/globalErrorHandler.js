const globalErrorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

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
    }

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
};

export default globalErrorHandler;