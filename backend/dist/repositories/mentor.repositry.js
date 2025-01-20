import Mentor from "../models/mentor.model.js";
// Submit mentor request
export const submitMentorRequest = async (data) => {
    return await Mentor.create(data);
};
//get all mentor request
export const getAllMentorRequests = async () => {
    return await Mentor.find()
        .populate("userId") // Populate user details
        .populate("skills", "name"); // Populate skills with only the 'name' field
};
//get All Mentors
export const getAllMentors = async () => {
    const mentor = await Mentor.find({ isApproved: "Completed" })
        .populate("userId")
        .populate("skills");
    return mentor;
};
//Get mentor Details
export const getMentorDetails = async (id) => {
    const mentor = await Mentor.findById(id)
        .populate("userId")
        .populate("skills");
    return mentor;
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
// Cancel mentorship
export const cancelMentorship = async (id) => {
    return await Mentor.findByIdAndUpdate(id, { isApproved: "Processing" }, { new: true });
};
// Get mentor by userId
export const getMentorById = async (id) => {
    const mentor = await Mentor.findById(id)
        .populate("userId", "name email")
        .populate("skills", "name");
    return mentor;
};
export const getMentorByUserId = async (id) => {
    const mentor = await Mentor.findOne({ userId: id })
        .populate("userId")
        .populate("skills");
    return mentor;
};
// Update  for mentor with mentorId
export const updateMentorById = async (mentorId, updateData) => {
    return await Mentor.findByIdAndUpdate(mentorId, updateData, { new: true });
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