export const fileValidationTypes = {
  image: [
    "image/jpeg", // JPEG images
    "image/png", // PNG images
    "image/jpg", // jpg images
    "image/gif", // GIF images
    "image/webp", // WebP images
    "image/bmp", // BMP images
    "image/svg+xml", // SVG images
  ],
  document: [
    "pdf",
    "application/pdf", // PDF documents
    // "application/msword", // Microsoft Word (.doc)
    // "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Microsoft Word (.docx)
    // "application/vnd.ms-excel", // Microsoft Excel (.xls)
    // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Microsoft Excel (.xlsx)
    // "application/vnd.ms-powerpoint", // Microsoft PowerPoint (.ppt)
    // "application/vnd.openxmlformats-officedocument.presentationml.presentation", // Microsoft PowerPoint (.pptx)
    // "text/plain", // Plain text files
    // "application/rtf", // Rich Text Format
    // "application/json",
  ],
  video: [
    "video/mp4", // MP4 video
    "video/x-matroska", // MKV video
    "video/webm", // WebM video
    "video/quicktime", // MOV video
    "video/x-msvideo", // AVI video
    "video/x-flv", // FLV video
  ],
};
