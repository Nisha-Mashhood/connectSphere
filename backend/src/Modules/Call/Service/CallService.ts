import { CallLogRepository } from "../Repositry/CallRepositry";
import { ICallLog } from "../../../Interfaces/models/IcallLog";
import logger from "../../../core/Utils/Logger";
import { ServiceError } from "../../../core/Utils/ErrorHandler";
import { BaseService } from "../../../core/Services/BaseService";

export class CallService extends BaseService {
  private callLogRepo: CallLogRepository;

  constructor() {
    super();
    this.callLogRepo = new CallLogRepository();
  }

  async getCallLogsByUserId(userId?: string): Promise<ICallLog[]> {
    try {
      if (!userId) {
        logger.error("User ID is required");
        throw new ServiceError("User ID is required");
      }
      logger.debug(`Fetching call logs for userId: ${userId}`);
      this.checkData(userId);
      const callLogs = await this.callLogRepo.findCallLogsByUserId(userId);
      logger.info(`Retrieved ${callLogs.length} call logs for userId: ${userId}`);
      return callLogs;
    } catch (error: any) {
      logger.error(`Error in CallService.getCallLogsByUserId: ${error.message}`);
      throw new ServiceError(`Failed to fetch call logs: ${error.message}`);
    }
  }
}