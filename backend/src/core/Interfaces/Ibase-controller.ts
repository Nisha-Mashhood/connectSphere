import { Response } from 'express';

export interface IBaseController <T = any>{
  sendSuccess(res: Response, data: T, message: string, statusCode?: number): void;
  sendCreated(res: Response, data: T, message: string): void;
  sendNoContent(res: Response, message: string): void;
}