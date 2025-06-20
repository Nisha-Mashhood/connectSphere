import { Response } from 'express';
import { IBaseController } from '../Interfaces/IBaseController.js';
export declare abstract class BaseController implements IBaseController {
    sendSuccess: (res: Response, data: any, message?: string, statusCode?: number) => void;
    sendCreated: (res: Response, data: any, message?: string) => void;
    sendNoContent: (res: Response, message?: string) => void;
    handleError: (error: any, res: Response) => void;
    throwError: (statusCode: number, message: string) => never;
}
//# sourceMappingURL=BaseController.d.ts.map