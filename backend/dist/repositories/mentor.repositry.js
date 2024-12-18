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
// Get mentor by userId
export const getMentorByUserId = async (userId) => {
    return await Mentor.findOne({ userId });
};
// Update  for mentor with mentorId
export const updateMentorById = async (mentorId, updateData) => {
    return await Mentor.findByIdAndUpdate(mentorId, updateData, { new: true });
};
//# sourceMappingURL=mentor.repositry.js.map