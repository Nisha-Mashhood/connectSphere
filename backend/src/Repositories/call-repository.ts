import { RepositoryError } from "../core/utils/error-handler";
import { BaseRepository } from "../core/repositries/base-repositry";
import logger from "../core/utils/logger";
import { ICallLog } from "../Interfaces/Models/i-call-log";
import callModal from "../Models/call-model";
import { ICallLogPopulated } from "../Utils/types/call-types";
import { ICallLogRepository } from "../Interfaces/Repository/i-call-repositry";
import { StatusCodes } from "../enums/status-code-enums";
import { inject, injectable } from "inversify";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { ERROR_MESSAGES } from "../constants/error-messages";

@injectable()
export class CallLogRepository extends BaseRepository<ICallLog> implements ICallLogRepository {
  private _userRepository: IUserRepository;

  constructor(@inject('IUserRepository') userRepository : IUserRepository) {
    super(callModal);
    this._userRepository = userRepository;
  }

  public createCallLog = async(data: Partial<ICallLog>): Promise<ICallLog> =>{
    try {
      logger.debug(
        `Creating call log for chatKey: ${data.chatKey}, senderId: ${data.senderId}, CallId: ${data.CallId}`
      );
      const callLog = await this.create(data);
      logger.info(
        `Created call log: ${callLog._id}, CallId: ${callLog.CallId}, status: ${callLog.status}`
      );
      return callLog;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating call log`, err);
      throw new RepositoryError(
        ERROR_MESSAGES.FAILED_TO_CREATE_CALL_LOG,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public updateCallLog = async (
    CallId: string,
    data: Partial<ICallLog>
  ): Promise<ICallLog | null> => {
    try {
      logger.debug(`Updating call log for CallId: ${CallId}`);
      const callLog = await this.model
        .findOneAndUpdate(
          { CallId },
          { ...data, updatedAt: new Date() },
          { new: true }
        )
        .exec();
      if (!callLog) {
        logger.warn(`Call log not found for CallId: ${CallId}`);
        throw new RepositoryError(
          `${ERROR_MESSAGES.CALL_LOG_NOT_FOUND} for CallId: ${CallId}`,
          StatusCodes.NOT_FOUND
        );
      }
      logger.info(
        `Updated call log: ${callLog._id}, CallId: ${callLog.CallId}, status: ${callLog.status}`
      );
      return callLog;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating call log for CallId: ${CallId}`, err);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_UPDATE_CALL_LOG} for CallId: ${CallId}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public findCallLogByCallId = async (CallId: string): Promise<ICallLog | null> => {
    try {
      logger.debug(`Finding call log by CallId: ${CallId}`);
      const callLog = await this.model.findOne({ CallId }).exec();
      if (callLog) {
        logger.debug(`Found call log: ${callLog._id}, CallId: ${CallId}`);
      } else {
        logger.debug(`No call log found for CallId: ${CallId}`);
      }
      return callLog;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error finding call log by CallId: ${CallId}`, err);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_FIND_CALL_LOG} by CallId: ${CallId}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public findCallLogsByUserId = async (
    userId: string
  ): Promise<ICallLogPopulated[]> => {
    try {
      logger.debug(`Finding call logs for userId: ${userId}`);
      const callLogs = await this.model
        .find({
          $or: [{ senderId: userId }, { recipientIds: userId }],
        })
        .sort({ createdAt: -1 })
        .exec();

      const populatedCallLogs = await Promise.all(
        callLogs.map(async (log) => {
          let senderDetails = null;
          let recipientDetails: any[] = [];

          try {
            senderDetails = await this._userRepository.getUserById(
              log.senderId as string
            );
          } catch (error) {
            logger.warn(
              `Failed to fetch sender details for userId ${log.senderId}: ${error}`
            );
          }

          try {
            recipientDetails = await Promise.all(
              (log.recipientIds as string[]).map(async (id) => {
                try {
                  return await this._userRepository.getUserById(id);
                } catch (error) {
                  logger.warn(
                    `Failed to fetch recipient details for userId ${id}: ${error}`
                  );
                  return null;
                }
              })
            );
          } catch (error) {
            logger.warn(`Error fetching recipient details: ${error}`);
          }

          return {
            ...log.toObject(),
            senderId: senderDetails
              ? {
                  _id: senderDetails._id,
                  name: senderDetails.name,
                  profilePic: senderDetails.profilePic ?? null,
                }
              : { _id: log.senderId, name: "Unknown", profilePic: null },

            recipientIds: recipientDetails.filter(Boolean).map((user) => ({
              _id: user!._id,
              name: user!.name,
              profilePic: user!.profilePic ?? null,
            })),
          };
        })
      );

      logger.info(
        `Retrieved ${populatedCallLogs.length} call logs for userId: ${userId}`
      );
      return populatedCallLogs;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error finding call logs for userId: ${userId}`, err);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_FETCH_CALL_LOGS} for userId: ${userId}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }
}