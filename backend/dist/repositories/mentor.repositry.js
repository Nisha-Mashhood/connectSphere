import Mentor from "../models/mentor.model.js";
// Submit mentor request
export const submitMentorRequest = async (data) => {
    return await Mentor.create(data);
};
//get all mentor request
export const getAllMentorRequests = async (page = 1, limit = 10, search = "", status = "", sort = "desc") => {
    const query = {};
    if (status)
        query.isApproved = status;
    const mentors = await Mentor.find(query)
        .populate("userId", "name email")
        .populate("skills", "name")
        .sort({ createdAt: sort === "desc" ? -1 : 1 });
    // Filter in memory
    const filteredMentors = search
        ? mentors.filter((mentor) => {
            const user = mentor.userId;
            return ((user?.name && user.name.toLowerCase().includes(search.toLowerCase())) ||
                (user?.email && user.email.toLowerCase().includes(search.toLowerCase())));
        })
        : mentors;
    const total = filteredMentors.length;
    const paginatedMentors = filteredMentors.slice((page - 1) * limit, page * limit);
    return { mentors: paginatedMentors, total };
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