import multer from "multer";
// import { cloudConfiguration } from "./cloudinary.js";
// import { CloudinaryStorage } from "multer-storage-cloudinary";

export const uploadCloudFile = ({
  fileValidation = [],
}) => {
  // Configure multer storage
  const storage = multer.diskStorage({});

  // File filter to restrict file types (optional)
  const fileFilter = (req, file, cb) => {
    if (fileValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"), false);
    }
  };

  // Multer upload configuration
  return multer({
    dest: "tempUpload",
    fileFilter,
  });
};
