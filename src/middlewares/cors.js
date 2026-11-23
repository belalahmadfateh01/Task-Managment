const normalizeOrigin = (value) => {
    try {
        return new URL(value).origin;
    } catch {
        return null;
    }
};

const createCorsMiddleware = (origins) => {
    const allowedOrigins = new Set(origins.map(normalizeOrigin).filter(Boolean));
    return (req, res, next) => {
        const origin = req.headers.origin;
        if (origin && !allowedOrigins.has(normalizeOrigin(origin))) {
            console.warn(`Blocked request from unconfigured origin: ${origin}`);
            return res.status(403).json({
                success: false,
                statusCode: 403,
                message: `Origin is not allowed: ${origin}. Add it to CLIENT_ORIGINS.`,
            });
        }
        if (origin) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Vary", "Origin");
            res.setHeader("Access-Control-Allow-Credentials", "true");
        }
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        res.setHeader("Access-Control-Max-Age", "600");
        if (req.method === "OPTIONS") return res.sendStatus(204);
        next();
    };
};

export default createCorsMiddleware;
