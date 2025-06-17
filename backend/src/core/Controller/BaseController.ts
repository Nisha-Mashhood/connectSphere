import { Response } from 'express';
import logger from '../Utils/Logger.js';

export abstract class BaseController {
  // Send a 200 OK response 
  protected sendSuccess(res: Response, data: any, message: string = 'Success'): void {
    logger.info(`Sending response: ${message}`);
    res.status(200).json({
      status: 'success',
      message,
      data,
    });
  }

  // Send a 201 Created response 
  protected sendCreated(res: Response, data: any, message: string = 'Created'): void {
    logger.info(`Sending created response: ${message}`);
    res.status(201).json({
      status: 'success',
      message,
      data,
    });
  }

  // Send a 204 No Content response 
  protected sendNoContent(res: Response, message: string = 'Deleted'): void {
    logger.info(`Sending no content response: ${message}`);
    res.status(204).send();
  }
}