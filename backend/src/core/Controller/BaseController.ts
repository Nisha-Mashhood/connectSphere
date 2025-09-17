import { Response } from 'express';
import { IBaseController } from '../Interfaces/IBaseController';
import logger from '../Utils/Logger';
import { StatusCodes } from '../../Enums/StatusCode.constants';

export abstract class BaseController<T = unknown> implements IBaseController {
  sendSuccess = (res: Response, data: T, message: string = 'Success'): void => {
    logger.info(`Sending response: ${message}`);
    res.status(StatusCodes.OK).json({
      status: 'success',
      message,
      data,
    });
  }

  sendCreated = (res: Response, data: T, message: string = 'Created'): void => {
    logger.info(`Sending created response: ${message}`);
    res.status(StatusCodes.CREATED).json({
      status: 'success',
      message,
      data,
    });
  }

  sendNoContent = (res: Response, message: string = 'Deleted'): void => {
    logger.info(`Sending no content response: ${message}`);
    res.status(StatusCodes.NO_CONTENT).send();
  }

}
