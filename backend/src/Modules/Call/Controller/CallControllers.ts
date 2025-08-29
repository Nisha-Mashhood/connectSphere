import { Request, Response } from "express";
import { BaseController } from "../../../core/Controller/BaseController";
import { CallService } from "../Service/CallService";
import logger from "../../../core/Utils/Logger";
import { ICallLog } from "../../../Interfaces/models/IcallLog";

export class CallController extends BaseController {
  private callService: CallService;

  constructor() {
    super();
    this.callService = new CallService();
  }

  async getCallLogsByUserId(req: Request, res: Response ): Promise<void> {
    try {
      const userId = req.currentUser?._id;

      if (!userId ) {
        logger.error("User ID not provided in request");
        this.throwError(400, 'User ID not provided');
      }

      logger.debug(`Handling request to get call logs for userId: ${userId}`);
      const callLogs: ICallLog[] = await this.callService.getCallLogsByUserId(userId?.toString());
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
      this.handleError(error, res);
    }
  }
}