import { RepositoryError } from '../Utils/ErrorHandler.js';
import logger from '../Utils/Logger.js';
import GroupRequest from '../../models/groupRequest.model.js';
import MentorRequest from '../../models/mentorRequset.js';

export class CleanupRepository {
  
  async deleteOldGroupRequests(cutoffDate: Date): Promise<number> {
    try {
      logger.debug(`Deleting GroupRequest documents older than ${cutoffDate}`);
      const result = await GroupRequest.deleteMany({
        updatedAt: { $lt: cutoffDate },
      }).exec();
      logger.info(`Deleted ${result.deletedCount} old GroupRequest documents`);
      return result.deletedCount || 0;
    } catch (error: any) {
      logger.error(`Failed to delete old GroupRequest documents: ${error.message}`);
      throw new RepositoryError(`Failed to delete old GroupRequest documents: ${error.message}`);
    }
  }

  async deleteOldMentorRequests(cutoffDate: Date): Promise<number> {
    try {
      logger.debug(`Deleting MentorRequest documents older than ${cutoffDate}`);
      const result = await MentorRequest.deleteMany({
        updatedAt: { $lt: cutoffDate },
      }).exec();
      logger.info(`Deleted ${result.deletedCount} old MentorRequest documents`);
      return result.deletedCount || 0;
    } catch (error: any) {
      logger.error(`Failed to delete old MentorRequest documents: ${error.message}`);
      throw new RepositoryError(`Failed to delete old MentorRequest documents: ${error.message}`);
    }
  }
}