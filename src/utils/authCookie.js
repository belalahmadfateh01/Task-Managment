const configuredSameSite = String(process.env.AUTH_COOKIE_SAME_SITE ?? "lax").toLowerCase();
const sameSite = ["lax", "strict", "none"].includes(configuredSameSite) ? configuredSameSite : "lax";

const authCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || sameSite === "none",
    sameSite,
    path: "/",
};

export default authCookieOptions;
