import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

const authentication = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const cookieToken = req.headers.cookie
        ?.split(";")
        .map(value => value.trim())
        .find(value => value.startsWith("access_token="))
        ?.slice("access_token=".length);
    const [scheme, bearerToken] = authHeader?.split(" ") ?? [];
    const token = cookieToken || (scheme === "Bearer" ? bearerToken : null);
    if (!token) throw new ApiError(401, "Unauthorized");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.employee = decoded;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid or expired token");
    }
};

export default authentication;
