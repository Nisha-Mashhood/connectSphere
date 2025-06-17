import logger from '../Utils/Logger.js';
import { ServiceError } from '../Utils/ErrorHandler.js';

export abstract class BaseService {
  // Check if data is provided
  protected checkData(data: any): void {
    if (!data) {
      logger.error('No data provided');
      throw new ServiceError('No data provided');
    }
    logger.debug('Data checked successfully');
  }
}