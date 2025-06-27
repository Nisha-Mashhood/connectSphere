import { RepositoryError } from '../Utils/ErrorHandler';
import logger from '../Utils/Logger';
import GroupRequest from '../../models/groupRequest.model';
import MentorRequest from '../../models/mentorRequset';

export class CleanupRepository {
  
  deleteOldGroupRequests = async(cutoffDate: Date): Promise<number> => {
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

  deleteOldMentorRequests = async(cutoffDate: Date): Promise<number> => {
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