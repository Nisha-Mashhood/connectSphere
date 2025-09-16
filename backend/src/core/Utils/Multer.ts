import multer from "multer";
import path from "path";
import { Request, Response, NextFunction } from "express";

// Define storage for multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
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
    cb(new Error("Invalid file type. Only JPEG, JPG, PNG, MP4, PDF, DOC, and DOCX are allowed."), false);
  }
};

// Multer configuration
const multerInstance = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Custom error-handling wrapper for Multer
const createMulterMiddleware = (multerMethod: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    multerMethod(req, res, (err: Error |  multer.MulterError) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error",
          data: '',
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "An error occurred during file upload",
          data: '',
        });
      }
      return next();
    });
  };
};

// Export wrapped Multer methods to match original usage in routes
export const upload = {
  fields: (fields: { name: string; maxCount?: number }[]) =>
    createMulterMiddleware(multerInstance.fields(fields)),
  single: (fieldName: string) => createMulterMiddleware(multerInstance.single(fieldName)),
  array: (fieldName: string, maxCount?: number) =>
    createMulterMiddleware(multerInstance.array(fieldName, maxCount)),
  any: () => createMulterMiddleware(multerInstance.any()),
};