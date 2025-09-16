import { Request, Response, NextFunction } from "express";
import { BaseController } from "../Core/Controller/BaseController";
import logger from "../Core/Utils/Logger";
import { ICallController } from "../Interfaces/Controller/ICallController";
import { HttpError } from "../Core/Utils/ErrorHandler";
import { ICallLogPopulated } from "../Utils/Types/Call.types";
import { StatusCodes } from "../Constants/StatusCode.constants";
import { ICallService } from "../Interfaces/Services/ICallService";
import { inject } from "inversify";

export class CallController extends BaseController implements ICallController{
  private _callService: ICallService;

  constructor(@inject('ICallService') callService : ICallService) {
    super();
    this._callService = callService;
  }

  async getCallLogsByUserId(req: Request, res: Response, next:NextFunction ): Promise<void> {
    try {
      const userId = req.currentUser?._id;

      if (!userId ) {
        logger.error("User ID not provided in request");
       throw new HttpError('User ID not provided', StatusCodes.BAD_REQUEST);
      }

      logger.debug(`Handling request to get call logs for userId: ${userId}`);
      const callLogs: ICallLogPopulated[] = await this._callService.getCallLogsByUserId(userId?.toString());
      if(callLogs){
        logger.info("call Log fetched : ",callLogs);
      }

      if (callLogs.length === 0) {
        this.sendSuccess(res, [], "No call logs found");
        logger.info(`No call logs found for userId: ${userId}`);
        return;
      }

      this.sendSuccess(res, callLogs, `Successfully retrieved ${callLogs.length} call logs for user ${userId}`);
    } catch (error: any) {
      logger.error(`Error in CallController.getCallLogsByUserId: ${error.message}`);
      next(error);
    }
  }
}