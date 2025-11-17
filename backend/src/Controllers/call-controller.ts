import { Request, Response, NextFunction } from "express";
import { BaseController } from "../core/controller/base-controller";
import logger from "../core/utils/logger";
import { ICallController } from "../Interfaces/Controller/i-call-controller";
import { HttpError } from "../core/utils/error-handler";
import { ICallLogPopulated } from "../Utils/types/call-types";
import { StatusCodes } from "../enums/status-code-enums";
import { ICallService } from "../Interfaces/Services/i-call-service";
import { inject, injectable } from "inversify";
import { ERROR_MESSAGES } from "../constants/error-messages";
import { CALL_MESSAGES } from "../constants/messages";

@injectable()
export class CallController extends BaseController implements ICallController{
  private _callService: ICallService;

  constructor(@inject('ICallService') callService : ICallService) {
    super();
    this._callService = callService;
  }

  async getCallLogsByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.currentUser?._id;

      if (!userId) {
        logger.error("User ID not provided in request");
        throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID, StatusCodes.BAD_REQUEST);
      }

      logger.debug(`Handling request to get call logs for userId: ${userId}`);
      const callLogs: ICallLogPopulated[] = await this._callService.getCallLogsByUserId(userId?.toString());
      if (callLogs) {
        logger.info("call Log fetched : ", callLogs);
      }

      if (callLogs.length === 0) {
        this.sendSuccess(res, [], CALL_MESSAGES.NO_CALL_LOGS_FOUND);
        logger.info(`No call logs found for userId: ${userId}`);
        return;
      }

      this.sendSuccess(res, callLogs, CALL_MESSAGES.CALL_LOGS_RETRIEVED);
    } catch (error: any) {
      logger.error(`Error in CallController.getCallLogsByUserId: ${error.message}`);
      next(error);
    }
  }
}