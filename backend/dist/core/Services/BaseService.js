import logger from '../Utils/Logger.js';
import { ServiceError } from '../Utils/ErrorHandler.js';
export class BaseService {
    // Check if data is provided
    checkData = (data) => {
        if (!data) {
            logger.error('No data provided');
            throw new ServiceError('No data provided');
        }
        logger.debug('Data checked successfully');
    };
    throwError = (message) => {
        logger.error(`Service error: ${message}`);
        throw new ServiceError(message);
    };
}
//# sourceMappingURL=BaseService.js.map