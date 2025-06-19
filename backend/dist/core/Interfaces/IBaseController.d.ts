import { Response } from 'express';
export interface IBaseController {
    sendSuccess(res: Response, data: any, message: string, statusCode?: number): void;
    sendCreated(res: Response, data: any, message: string): void;
    sendNoContent(res: Response, message: string): void;
    handleError(error: any, res: Response): void;
    throwError(statusCode: number, message: string): never;
}
//# sourceMappingURL=IBaseController.d.ts.map