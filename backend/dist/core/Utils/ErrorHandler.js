import logger from "./Logger.js";
// HTTP Error (Controller)
export class HttpError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "HttpError";
        logger.error(`HttpError: ${message} (Status: ${statusCode})`);
    }
}
// Service Error
export class ServiceError extends Error {
    constructor(message) {
        super(message);
        this.name = "ServiceError";
        logger.error(`ServiceError: ${message}`);
    }
}
// Repository Error
export class RepositoryError extends Error {
    constructor(message) {
        super(message);
        this.name = "RepositoryError";
        logger.error(`RepositoryError: ${message}`);
    }
}
// Middleware to handle errors and send formatted responses
export const errorHandler = (error, _req, res, next) => {
    if (error instanceof HttpError) {
        logger.warn(`HTTP error: ${error.message} [${error.statusCode}] `);
        res
            .status(error.statusCode)
            .json({ status: "error", message: error.message });
        return;
    }
    else if (error instanceof ServiceError ||
        error instanceof RepositoryError) {
        logger.error(`Application error: ${error.message}`);
        res.status(400).json({ status: "error", message: error.message });
        return;
    }
    else {
        logger.error(`Unexpected error: ${error.message}`);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
    next();
};
//# sourceMappingURL=ErrorHandler.js.map