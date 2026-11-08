let catchAsyncError = (fn) => {
    return async (req, res, next) => {
        const request = `${req.method} ${req.originalUrl}`;
        console.log(`CONTROLLER START ${request}`);
        try {
            await fn(req, res, next);
            console.log(`CONTROLLER DONE ${request} response=${res.statusCode} sent=${res.headersSent}`);
        } catch (err) {
            console.error(`CONTROLLER ERROR ${request}`, err);
            next(err);
        }
    };
};

export default catchAsyncError;
