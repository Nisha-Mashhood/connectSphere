import { Request, Response } from 'express';

export interface IBaseController {

  handleRequest(req: Request, res: Response): Promise<void>;
  
}