const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map();
let requestsSinceCleanup = 0;

const loginRateLimit = (req, res, next) => {
    const now = Date.now();
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const key = `${req.ip || req.socket.remoteAddress || "unknown"}:${email}`;
    let entry = attempts.get(key);

    if (entry && now - entry.firstAttemptAt >= WINDOW_MS) {
        attempts.delete(key);
        entry = undefined;
    }
    if (entry?.count >= MAX_ATTEMPTS) {
        const retryAfterSeconds = Math.max(1, Math.ceil((entry.firstAttemptAt + WINDOW_MS - now) / 1000));
        res.setHeader("Retry-After", String(retryAfterSeconds));
        return res.status(429).json({
            success: false,
            statusCode: 429,
            message: "تلاش‌های ورود بیش از حد مجاز است. چند دقیقه بعد دوباره تلاش کنید.",
        });
    }

    res.once("finish", () => {
        if (res.statusCode === 401) {
            const current = attempts.get(key);
            attempts.set(key, current && now - current.firstAttemptAt < WINDOW_MS
                ? { ...current, count: current.count + 1 }
                : { count: 1, firstAttemptAt: now });
        } else if (res.statusCode >= 200 && res.statusCode < 300) {
            attempts.delete(key);
        }
    });

    requestsSinceCleanup++;
    if (requestsSinceCleanup >= 100) {
        requestsSinceCleanup = 0;
        for (const [attemptKey, value] of attempts) {
            if (now - value.firstAttemptAt >= WINDOW_MS) attempts.delete(attemptKey);
        }
        while (attempts.size > 10_000) {
            const oldestKey = attempts.keys().next().value;
            if (oldestKey === undefined) break;
            attempts.delete(oldestKey);
        }
    }

    next();
};

export default loginRateLimit;
