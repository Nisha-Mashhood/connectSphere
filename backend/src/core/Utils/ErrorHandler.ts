import logger from "./Logger";
import { Response } from "express";

// HTTP Error (Controller)
export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "HttpError";
    logger.error(`HttpError: ${message} (Status: ${statusCode})`);
  }
}

// Service Error
export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceError";
    logger.error(`ServiceError: ${message}`);
  }
}

// Repository Error
export class RepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryError";
    logger.error(`RepositoryError: ${message}`);
  }
}

// Middleware to handle errors and send formatted responses
export const errorHandler = (
  error: Error,
  _req: any,
  res: Response,
  next: any
) => {
  if (error instanceof HttpError) {
    logger.warn(`HTTP error: ${error.message} [${error.statusCode}] `);
    res
      .status(error.statusCode)
      .json({ status: "error", message: error.message });
    return;
  } else if (
    error instanceof ServiceError ||
    error instanceof RepositoryError
  ) {
    logger.error(`Application error: ${error.message}`);
    res.status(400).json({ status: "error", message: error.message });
    return;
  } else {
    logger.error(`Unexpected error: ${error.message}`);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
  next();
};

process.on("uncaughtException", (error: Error) => {
  logger.error(`Uncaught Exception: ${error.message}\nStack: ${error.stack}`);
  // res.status(500).json({ status: "error", message: "Internal server error" });
});

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error(`Unhandled Rejection at: ${promise}\nReason: ${reason?.message || reason}\nStack: ${reason?.stack || "No stack trace"}`);
  // res.status(500).json({ status: "error", message: "Internal server error" });
});