import cron from 'node-cron';
import logger from './logger';
import { RepositoryError } from './error-handler';
import { CleanupRepository } from '../repositries/clean-up-repositry';

export class CleanupScheduler {
  private cleanupRepo: CleanupRepository;

  constructor() {
    this.cleanupRepo = new CleanupRepository();
  }

  public async start(): Promise<void> {
    logger.info("✅ Cleanup scheduler started.");

    // Run cleanup once immediately at server start
    await this.runCleanup();

    // Schedule daily cleanup at midnight
    cron.schedule('0 0 * * *', () => {
      this.runCleanup();
    });
  }

  private async runCleanup(): Promise<void> {
    logger.info('🧹 Running cleanup task for old requests');
    try {
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      const deletedGroupRequests = await this.cleanupRepo.deleteOldGroupRequests(fifteenDaysAgo);
      const deletedMentorRequests = await this.cleanupRepo.deleteOldMentorRequests(fifteenDaysAgo);

      logger.info(`✅ Cleanup Summary: Deleted ${deletedGroupRequests} group requests, ${deletedMentorRequests} mentor requests`);
    } catch (error: any) {
      logger.error(`❌ Cleanup task failed: ${error.message}`);
      throw new RepositoryError(`Cleanup task failed: ${error.message}`);
    }
  }
}
