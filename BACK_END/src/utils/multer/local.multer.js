import multer from "multer";
import path from "path";
import fs from "fs";
// 📜 
export const uploadDiskFile = ({
  fileValidation = [],
  destinationFolder = "uploads",
    filePrefix = "file",
}) => {
  const basePath = `uploads/${destinationFolder}`;
    const fullPath = path.resolve(`./src/${basePath}`);
    
    

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  // Configure multer storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullPath); // Set the destination folder
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname); // Extract file extension
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        file.finalPath = basePath +'/'+ `${filePrefix}-${uniqueSuffix}${ext}`;
      cb(null, `${filePrefix}-${uniqueSuffix}${ext}`); // Create unique file name
    },
  });

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
    // dest: "defaultUpload",
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
    },
  });
};
