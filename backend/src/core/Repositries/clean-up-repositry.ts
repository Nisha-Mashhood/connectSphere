import { RepositoryError } from "../utils/error-handler";
import logger from "../utils/logger";
import GroupRequest from "../../Models/group-request-model";
import MentorRequest from "../../Models/mentor-requset-model";
import { ERROR_MESSAGES } from "../../constants/error-messages";

export class CleanupRepository {
  // Delete old GroupRequest Documents
  deleteOldGroupRequests = async (cutoffDate: Date): Promise<number> => {
    try {
      logger.debug(`Deleting GroupRequest documents older than ${cutoffDate}`);
      const result = await GroupRequest.deleteMany({
        updatedAt: { $lt: cutoffDate },
      }).exec();
      logger.info(`Deleted ${result.deletedCount} old GroupRequest documents`);
      return result.deletedCount || 0;
    } catch (error: any) {
      logger.error(`Failed to delete old GroupRequest documents: ${error.message}`);
      throw new RepositoryError(ERROR_MESSAGES.FAILED_TO_DELETE_OLD_GROUP_REQUESTS);
    }
  }

  // Delete old MentorRequest Documents
  deleteOldMentorRequests = async (cutoffDate: Date): Promise<number> => {
    try {
      logger.debug(`Deleting MentorRequest documents older than ${cutoffDate}`);
      const result = await MentorRequest.deleteMany({
        updatedAt: { $lt: cutoffDate },
      }).exec();
      logger.info(`Deleted ${result.deletedCount} old MentorRequest documents`);
      return result.deletedCount || 0;
    } catch (error: any) {
      logger.error(`Failed to delete old MentorRequest documents: ${error.message}`);
      throw new RepositoryError(ERROR_MESSAGES.FAILED_TO_DELETE_OLD_MENTOR_REQUESTS);
    }
  }
}