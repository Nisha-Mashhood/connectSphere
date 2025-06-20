import logger from '../Utils/Logger.js';
import { ServiceError } from '../Utils/ErrorHandler.js';
import { IBaseService } from '../Interfaces/IBaseService.js';

export abstract class BaseService implements IBaseService {
  // Check if data is provided
  checkData = (data: any): void => {
    if (!data) {
      logger.error('No data provided');
      throw new ServiceError('No data provided');
    }
    logger.debug('Data checked successfully');
  }

  throwError = (message: string): never => {
    logger.error(`Service error: ${message}`);
    throw new ServiceError(message);
  }
  
}

