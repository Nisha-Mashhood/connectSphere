import logger from './Logger.js';
import { Response } from 'express';

// HTTP Error (Controller)
export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'HttpError';
    logger.error(`HttpError: ${message} (Status: ${statusCode})`);
  }
}

// Service Error 
export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceError';
    logger.error(`ServiceError: ${message}`);
  }
}

// Repository Error 
export class RepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RepositoryError';
    logger.error(`RepositoryError: ${message}`);
  }
}

// Middleware to handle errors and send formatted responses
export const errorHandler = (error: Error, _req: any, res: Response, _next: any) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ status: 'error', message: error.message });
    return;
  }
  if (error instanceof ServiceError || error instanceof RepositoryError) {
    res.status(400).json({ status: 'error', message: error.message });
    return;
  }
  logger.error(`Unexpected error: ${error.message}`);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
};