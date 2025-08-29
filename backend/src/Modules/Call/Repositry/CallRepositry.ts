import { RepositoryError } from "../../../core/Utils/ErrorHandler";
import { BaseRepository } from "../../../core/Repositries/BaseRepositry";
import logger from "../../../core/Utils/Logger";
import { ICallLog } from "../../../Interfaces/models/IcallLog";
import callModal from "../../../models/call.modal";
import { UserRepository } from "../../Auth/Repositry/UserRepositry";
import { ICallLogPopulated } from "../Types/types";

export class CallLogRepository extends BaseRepository<ICallLog> {
  private userRepository: UserRepository;

  constructor() {
    super(callModal);
    this.userRepository = new UserRepository();
  }

  public async createCallLog(data: Partial<ICallLog>): Promise<ICallLog> {
    try {
      logger.debug(
        `Creating call log for chatKey: ${data.chatKey}, senderId: ${data.senderId}, CallId: ${data.CallId}`
      );
      const callLog = await this.create(data);
      logger.info(
        `Created call log: ${callLog._id}, CallId: ${callLog.CallId}, status: ${callLog.status}`
      );
      return callLog;
    } catch (error: any) {
      logger.error(`Error creating call log: ${error.message}`);
      throw new RepositoryError(`Failed to create call log: ${error.message}`);
    }
  }

  public async updateCallLog(
    CallId: string,
    data: Partial<ICallLog>
  ): Promise<ICallLog | null> {
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
        logger.error(`Call log not found for CallId: ${CallId}`);
        throw new RepositoryError(`Call log not found for CallId: ${CallId}`);
      }
      logger.info(
        `Updated call log: ${callLog._id}, CallId: ${callLog.CallId}, status: ${callLog.status}`
      );
      return callLog;
    } catch (error: any) {
      logger.error(
        `Error updating call log for CallId: ${CallId}: ${error.message}`
      );
      throw new RepositoryError(
        `Failed to update call log for CallId: ${CallId}: ${error.message}`
      );
    }
  }

  public async findCallLogByCallId(CallId: string): Promise<ICallLog | null> {
    try {
      logger.debug(`Finding call log by CallId: ${CallId}`);
      const callLog = await this.model.findOne({ CallId }).exec();
      if (callLog) {
        logger.debug(`Found call log: ${callLog._id}, CallId: ${CallId}`);
      } else {
        logger.debug(`No call log found for CallId: ${CallId}`);
      }
      return callLog;
    } catch (error: any) {
      logger.error(
        `Error finding call log by CallId: ${CallId}: ${error.message}`
      );
      throw new RepositoryError(
        `Failed to find call log by CallId: ${CallId}: ${error.message}`
      );
    }
  }

  public async findCallLogsByUserId(
    userId: string
  ): Promise<ICallLogPopulated[]> {
    try {
      logger.debug(`Finding call logs for userId: ${userId}`);
      const callLogs = await this.model
        .find({
          $or: [{ senderId: userId }, { recipientIds: userId }],
        })
        .sort({ createdAt: -1 })
        .exec();

      // Fetch user details for senderId and recipientIds
      const populatedCallLogs = await Promise.all(
        callLogs.map(async (log) => {
          let senderDetails = null;
          let recipientDetails: any[] = [];

          try {
            senderDetails = await this.userRepository.getUserById(
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
                  return await this.userRepository.getUserById(id);
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
      logger.debug(
        `Call logs for userId ${userId}: ${JSON.stringify(
          populatedCallLogs.map((log) => ({
            _id: log._id,
            CallId: log.CallId,
            status: log.status,
            createdAt: log.createdAt,
            sender: log.senderId,
            recipients: log.recipientIds,
          })),
          null,
          2
        )}`
      );
      return populatedCallLogs;
    } catch (error: any) {
      logger.error(
        `Error finding call logs for userId: ${userId}: ${error.message}`
      );
      throw new RepositoryError(
        `Failed to find call logs for userId: ${userId}: ${error.message}`
      );
    }
  }
}
