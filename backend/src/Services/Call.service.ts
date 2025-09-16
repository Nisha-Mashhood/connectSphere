import { inject, injectable } from "inversify";
import logger from "../Core/Utils/Logger";
import { ServiceError } from "../Core/Utils/ErrorHandler";
import { ICallLogPopulated } from "../Utils/Types/Call.types";
import { ICallService } from "../Interfaces/Services/ICallService";
import { ICallLogRepository } from "../Interfaces/Repository/ICallRepositry";

@injectable()
export class CallService implements ICallService{
  private _callLogRepository: ICallLogRepository;

  constructor(@inject('ICallLogRepository') callLogRepository : ICallLogRepository ) {
    this._callLogRepository = callLogRepository;
  }

  public getCallLogsByUserId = async(userId?: string): Promise<ICallLogPopulated[]> => {
    try {
      if (!userId) {
        logger.error("User ID is required");
        throw new ServiceError("User ID is required");
      }
      logger.debug(`Fetching call logs for userId: ${userId}`);
      const callLogs = await this._callLogRepository.findCallLogsByUserId(userId);
      logger.info(`Retrieved ${callLogs.length} call logs for userId: ${userId}`);
      return callLogs;
    } catch (error: any) {
      logger.error(`Error in CallService.getCallLogsByUserId: ${error.message}`);
      throw new ServiceError(`Failed to fetch call logs: ${error.message}`);
    }
  }
}