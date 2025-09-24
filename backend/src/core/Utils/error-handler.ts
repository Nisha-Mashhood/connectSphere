import logger from "./logger";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
    logger.error(`[${this.name}] ${message} (Status: ${statusCode})`);
  }
}

// HTTP Error (Controller-level)
export class HttpError extends AppError {
  constructor(message: string, statusCode: number = 400, details?: any) {
    super(message, statusCode, details);
    this.name = "HttpError";
  }
}

// Service Error
export class ServiceError extends AppError {
  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message, statusCode, details);
    this.name = "ServiceError";
  }
}

// Repository Error
export class RepositoryError extends AppError {
  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message, statusCode, details);
    this.name = "RepositoryError";
  }
}
