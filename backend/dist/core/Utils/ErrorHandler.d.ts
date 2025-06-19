import { Response } from "express";
export declare class HttpError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string);
}
export declare class ServiceError extends Error {
    constructor(message: string);
}
export declare class RepositoryError extends Error {
    constructor(message: string);
}
export declare const errorHandler: (error: Error, _req: any, res: Response, next: any) => void;
//# sourceMappingURL=ErrorHandler.d.ts.map