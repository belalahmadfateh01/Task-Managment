const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "bmp",
  "avif",
]);

export function attachmentStyle(name: string) {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  const isImage = IMAGE_EXTENSIONS.has(extension);
  const color = isImage
    ? "bg-pink-100 text-pink-700"
    : extension === "pdf"
      ? "bg-red-100 text-red-700"
      : ["doc", "docx"].includes(extension)
        ? "bg-blue-100 text-blue-700"
        : ["xls", "xlsx"].includes(extension)
          ? "bg-emerald-100 text-emerald-700"
          : ["ppt", "pptx"].includes(extension)
            ? "bg-orange-100 text-orange-700"
            : extension === "txt"
              ? "bg-slate-100 text-slate-700"
              : "bg-violet-100 text-violet-700";

  return { extension, isImage, color };
}
