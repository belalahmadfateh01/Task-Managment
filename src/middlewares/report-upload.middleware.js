import multer from "multer";
import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ApiError from "../utils/ApiError.js";

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads/reports");
mkdirSync(directory, { recursive: true });

const extensions = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/tiff": ".tif",
    "text/plain": ".txt",
    "text/csv": ".csv",
    "text/markdown": ".md",
    "text/rtf": ".rtf",
    "application/rtf": ".rtf",
    "application/json": ".json",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
    "application/vnd.oasis.opendocument.text": ".odt",
    "application/vnd.oasis.opendocument.spreadsheet": ".ods",
    "application/vnd.oasis.opendocument.presentation": ".odp",
    "application/zip": ".zip",
    "application/x-zip-compressed": ".zip",
    "application/x-7z-compressed": ".7z",
    "application/vnd.rar": ".rar",
    "application/x-rar-compressed": ".rar",
    "application/gzip": ".gz",
    "application/x-gzip": ".gz",
    "application/x-tar": ".tar",
    "application/x-bzip2": ".bz2",
};
const extensionAliases = new Map([[".jpeg", ".jpg"], [".tiff", ".tif"]]);
const allowedExtensions = new Set([...Object.values(extensions), ...extensionAliases.keys()]);
const extensionFor = file => {
    const originalExtension = path.extname(file.originalname).toLowerCase();
    return extensions[file.mimetype] || extensionAliases.get(originalExtension) || originalExtension;
};

const reportUpload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, callback) => callback(null, directory),
        filename: (_req, file, callback) => callback(null, `${randomUUID()}${extensionFor(file)}`),
    }),
    fileFilter: (_req, file, callback) => {
        if (extensions[file.mimetype] || allowedExtensions.has(path.extname(file.originalname).toLowerCase())) return callback(null, true);
        callback(new ApiError(400, "Supported attachments: PDF, images, text, CSV, JSON, Markdown, Word, Excel, PowerPoint, OpenDocument and ZIP/7z/RAR/GZIP archives."));
    },
    limits: { fileSize: 15 * 1024 * 1024 },
}).single("file");

export default reportUpload;
