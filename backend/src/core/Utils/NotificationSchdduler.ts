import cron from 'node-cron';
import logger from './Logger.js';
import { RepositoryError } from './ErrorHandler.js';
import { CleanupRepository } from '../Repositries/CleanUpRepositry.js';

export class CleanupScheduler {
  private cleanupRepo: CleanupRepository;

  constructor() {
    this.cleanupRepo = new CleanupRepository();
  }

  public start(): void {
    // Cleanup old GroupRequest and MentorRequest documents daily at midnight
    cron.schedule('0 0 * * *', async () => {
      logger.info('Running daily cleanup task for old requests');
      try {
        // Calculate the date 15 days ago
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        // Delete old GroupRequest documents
        const deletedGroupRequests = await this.cleanupRepo.deleteOldGroupRequests(fifteenDaysAgo);
        logger.info(`Cleanup: Deleted ${deletedGroupRequests} old GroupRequest documents`);

        // Delete old MentorRequest documents
        const deletedMentorRequests = await this.cleanupRepo.deleteOldMentorRequests(fifteenDaysAgo);
        logger.info(`Cleanup: Deleted ${deletedMentorRequests} old MentorRequest documents`);

        logger.info('Daily cleanup task completed successfully');
      } catch (error: any) {
        logger.error(`Daily cleanup task failed: ${error.message}`);
        throw new RepositoryError(`Daily cleanup task failed: ${error.message}`);
      }
    });

    logger.info('✅ Node-cron cleanup scheduler started.');
  }
}