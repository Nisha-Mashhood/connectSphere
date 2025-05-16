import GroupRequest from "../models/groupRequest.model.js";
import MentorRequest from "../models/mentorRequset.js";

export const deleteOldGroupRequests = async (cutoffDate: Date): Promise<number> => {
  try {
    const result = await GroupRequest.deleteMany({
      updatedAt: { $lt: cutoffDate },
    });
    return result.deletedCount || 0;
  } catch (error: any) {
    throw new Error("Failed to delete old GroupRequest documents: " + error.message);
  }
};

export const deleteOldMentorRequests = async (cutoffDate: Date): Promise<number> => {
  try {
    const result = await MentorRequest.deleteMany({
      updatedAt: { $lt: cutoffDate },
    });
    return result.deletedCount || 0;
  } catch (error: any) {
    throw new Error("Failed to delete old MentorRequest documents: " + error.message);
  }
};