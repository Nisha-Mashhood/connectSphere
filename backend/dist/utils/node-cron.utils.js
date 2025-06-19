// import cron from "node-cron";
// import * as CleanupRepository from "../repositories/cleanUp.repositry.js";
export {};
// export const scheduleNodeCorn = () => {
//   // Cleanup old GroupRequest and MentorRequest documents daily at midnight
//   cron.schedule("0 0 * * *", async () => {
//     console.log("Running daily cleanup task for old requests");
//     try {
//       // Calculate the date 15 days ago
//       const fifteenDaysAgo = new Date();
//       fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
//       // Delete old GroupRequest documents
//       const deletedGroupRequests = await CleanupRepository.deleteOldGroupRequests(fifteenDaysAgo);
//       console.log(`Cleanup: Deleted ${deletedGroupRequests} old GroupRequest documents`);
//       // Delete old MentorRequest documents
//       const deletedMentorRequests = await CleanupRepository.deleteOldMentorRequests(fifteenDaysAgo);
//       console.log(`Cleanup: Deleted ${deletedMentorRequests} old MentorRequest documents`);
//       console.log("Daily cleanup task completed successfully");
//     } catch (error: any) {
//       console.log(`Daily cleanup task failed: ${error.message}`);
//     }
//   });
//   console.log("✅ Node-cron scheduler started.");
// }
//# sourceMappingURL=node-cron.utils.js.map