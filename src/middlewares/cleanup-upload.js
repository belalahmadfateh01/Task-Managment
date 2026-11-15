import { unlink } from "node:fs/promises";

const cleanupUploadedFile = (req, res, next) => {
    if (!req.file?.path) return next();
    let cleaned = false;
    const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        void unlink(req.file.path).catch(() => {});
    };

    res.once("finish", () => {
        if (res.statusCode >= 400) cleanup();
    });
    res.once("close", () => {
        if (!res.writableEnded) cleanup();
    });
    next();
};

export default cleanupUploadedFile;
