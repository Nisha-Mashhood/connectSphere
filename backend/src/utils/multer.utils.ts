import multer from 'multer';
import path from "path";

// Define storage for multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/"); // Temporary storage folder
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Append timestamp to file name
  },
});

// File type validation
const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedFileTypes = /jpeg|jpg|png/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, JPG, and PNG are allowed."));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // File size limit: 5MB
});

