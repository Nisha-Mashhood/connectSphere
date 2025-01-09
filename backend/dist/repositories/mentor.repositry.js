import { Skill } from "../models/skills.model.js";
import Mentor from "../models/mentor.model.js";
// Submit mentor request
export const submitMentorRequest = async (data) => {
    return await Mentor.create(data);
};
//get all mentor request
export const getAllMentorRequests = async () => {
    return await Mentor.find()
        .populate("userId", "name email") // Populate user details
        .populate("skills", "name"); // Populate skills with only the 'name' field
};
// Approve mentor request
export const approveMentorRequest = async (id) => {
    await Mentor.findByIdAndUpdate(id, { isApproved: "Completed" }, { new: true });
    return;
};
// Reject mentor request
export const rejectMentorRequest = async (id) => {
    await Mentor.findByIdAndUpdate(id, { isApproved: "Rejected" }, { new: true });
    return;
};
// Get mentor by userId
export const getMentorByUserId = async (id) => {
    const mentor = await Mentor.findById(id)
        .populate("userId", "name email")
        .populate("skills", "name");
    return mentor;
};
// Update  for mentor with mentorId
export const updateMentorById = async (mentorId, updateData) => {
    return await Mentor.findByIdAndUpdate(mentorId, updateData, { new: true });
};
export const getSkills = async () => {
    return await Skill.find({}, { name: 1, _id: 1 });
};
// Function to save a new mentor request (pending admin review)
export const saveMentorRequest = async (mentorData) => {
    try {
        const mentor = new Mentor(mentorData);
        await mentor.save();
        return mentor;
    }
    catch (error) {
        throw new Error("Error saving mentor request: " + error.message);
    }
};
//# sourceMappingURL=mentor.repositry.js.map