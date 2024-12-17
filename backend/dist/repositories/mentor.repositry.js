import Mentor from "../models/mentor.model.js";
// Submit mentor request
export const submitMentorRequest = async (data) => {
    return await Mentor.create(data);
};
// Get all mentor requests
export const getAllMentorRequests = async () => {
    return await Mentor.find().populate("userId", "fullName email");
};
// Approve mentor request
export const approveMentorRequest = async (id) => {
    await Mentor.findByIdAndUpdate(id, { isApproved: true });
};
// Reject mentor request
export const rejectMentorRequest = async (id) => {
    await Mentor.findByIdAndDelete(id);
};
//# sourceMappingURL=mentor.repositry.js.map