import GroupRequest from "../models/groupRequest.model.js";
import MentorRequest from "../models/mentorRequset.js";
export const deleteOldGroupRequests = async (cutoffDate) => {
    try {
        const result = await GroupRequest.deleteMany({
            updatedAt: { $lt: cutoffDate },
        });
        return result.deletedCount || 0;
    }
    catch (error) {
        throw new Error("Failed to delete old GroupRequest documents: " + error.message);
    }
};
export const deleteOldMentorRequests = async (cutoffDate) => {
    try {
        const result = await MentorRequest.deleteMany({
            updatedAt: { $lt: cutoffDate },
        });
        return result.deletedCount || 0;
    }
    catch (error) {
        throw new Error("Failed to delete old MentorRequest documents: " + error.message);
    }
};
//# sourceMappingURL=cleanUp.repositry.js.map