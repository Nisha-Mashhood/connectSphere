import MentorRequest from "../models/mentorRequset.js";
import Collaboration from "../models/collaboration.js";
//create a temporary requset document
export const createTemporaryRequest = async (data) => {
    try {
        const request = new MentorRequest(data);
        return await request.save();
    }
    catch (error) {
        throw new Error(`Error saving temporary request: ${error.message}`);
    }
};
// Get mentor requests from the database
export const getMentorRequestsByMentorId = async (mentorId) => {
    try {
        return await MentorRequest.find({ mentorId })
            .populate("userId", "name profilePic");
    }
    catch (error) {
        throw new Error(`Error fetching mentor requests: ${error.message}`);
    }
};
// Find mentor request by ID
export const findMentorRequestById = async (id) => {
    try {
        return await MentorRequest.findById(id);
    }
    catch (error) {
        throw new Error(`Error fetching mentor request by ID: ${error.message}`);
    }
};
// Update mentor request acceptance status
export const updateMentorRequestStatus = async (id, status) => {
    try {
        const request = await MentorRequest.findById(id);
        if (request) {
            request.isAccepted = status;
            await request.save();
            return request;
        }
        throw new Error("Request not found");
    }
    catch (error) {
        throw new Error(`Error updating mentor request status: ${error.message}`);
    }
};
export const getRequestByUserId = async (userId) => {
    return await MentorRequest.find({ userId })
        .populate({
        path: 'mentorId',
        populate: {
            path: 'userId',
            select: 'name email profilePic'
        }
    });
};
export const createCollaboration = async (collaborationData) => {
    const collaborationResult = new Collaboration(collaborationData);
    return await collaborationResult.save();
};
export const deleteMentorRequest = async (requestId) => {
    await MentorRequest.findByIdAndDelete(requestId);
};
//# sourceMappingURL=collaboration.repositry.js.map