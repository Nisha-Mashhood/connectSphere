import { Request, Response, NextFunction } from "express";
import { AppError } from "../core/utils/error-handler";
import logger from "../core/utils/logger";


export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {  
  if (err instanceof AppError) {
    logger.error(`[Handled] ${err.name}: ${err.message}`);
    res.status(err.statusCode).json({
      status: "error",
      error: err.name,
      message: err.message,
      details: err.details || null,
    })
    return
  }

  logger.error(`[Unhandled] ${err.name}: ${err.message}\n${err.stack}`);
  res.status(500).json({
    status: "error",
    error: "InternalServerError",
    message: "Something went wrong. Please try again later.",
  })
}

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error(
    `Unhandled Rejection at: ${promise}\nReason: ${
      reason?.message || reason
    }\nStack: ${reason?.stack || "No stack trace"}`
  )
})
