import multer from "multer";
import path from "path";

// Define storage for multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/"); // Temporary storage folder
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Append timestamp to file name
  },
});

// File type validation
const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedFileTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "video/mp4",
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  ];

  const mimetype = allowedFileTypes.includes(file.mimetype);
  const extname = allowedFileTypes.some(type => 
    path.extname(file.originalname).toLowerCase() === `.${type.split("/")[1]}`
  );

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, JPG, PNG, MP4, PDF, DOC, and DOCX are allowed."));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});
