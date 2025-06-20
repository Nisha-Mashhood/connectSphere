import { HttpError, RepositoryError, ServiceError } from '../Utils/ErrorHandler.js';
import logger from '../Utils/Logger.js';
export class BaseController {
    sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
        logger.info(`Sending response: ${message}`);
        res.status(statusCode).json({
            status: 'success',
            message,
            data,
        });
    };
    sendCreated = (res, data, message = 'Created') => {
        logger.info(`Sending created response: ${message}`);
        res.status(201).json({
            status: 'success',
            message,
            data,
        });
    };
    sendNoContent = (res, message = 'Deleted') => {
        logger.info(`Sending no content response: ${message}`);
        res.status(204).send();
    };
    handleError = (error, res) => {
        if (error instanceof HttpError) {
            logger.warn(`HTTP error: ${error.message} [${error.statusCode}]`);
            res.status(error.statusCode).json({
                status: 'error',
                message: error.message,
            });
        }
        else if (error instanceof ServiceError || error instanceof RepositoryError) {
            logger.error(`Application error: ${error.message}`);
            res.status(400).json({
                status: 'error',
                message: error.message,
            });
        }
        else {
            logger.error(`Unexpected error: ${error.message || error}`);
            res.status(500).json({
                status: 'error',
                message: 'Internal Server Error',
            });
        }
    };
    throwError = (statusCode, message) => {
        logger.warn(`Throwing HTTP error: ${message} [${statusCode}]`);
        throw new HttpError(statusCode, message);
    };
}
//# sourceMappingURL=BaseController.js.map