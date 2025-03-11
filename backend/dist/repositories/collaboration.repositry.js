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
export const findCollabById = async (collabId) => {
    try {
        return await Collaboration.findById(collabId)
            .populate({
            path: "mentorId",
            populate: {
                path: "userId",
                model: "User",
            },
        })
            .populate("userId");
        ;
    }
    catch (error) {
        throw new Error("Error fetching group requests: " + error.message);
    }
};
export const deleteCollabById = async (collabId) => {
    try {
        return await Collaboration.findByIdAndDelete(collabId);
    }
    catch (error) {
        throw new Error("Error fetching group requests: " + error.message);
    }
};
//mark collaboration as cancelled
export const markCollabAsCancelled = async (collabId) => {
    try {
        return await Collaboration.findByIdAndUpdate(collabId, { isCancelled: true }, { new: true });
    }
    catch (error) {
        throw new Error("Error updating collaboration: " + error.message);
    }
};
//update feedback given filed of the collaboartion
export const updateCollabFeedback = async (collabId) => {
    try {
        return await Collaboration.findByIdAndUpdate(collabId, { feedbackGiven: true }, { new: true });
    }
    catch (error) {
        throw new Error(`Error updating collaboration feedback status: ${error.message}`);
    }
};
//Get collab data For user
export const getCollabDataForUser = async (userId) => {
    try {
        const collabData = await Collaboration.find({ userId, isCancelled: false })
            .populate({
            path: 'mentorId',
            populate: {
                path: 'userId',
                select: 'name email profilePic'
            }
        })
            .populate('userId');
        return collabData;
    }
    catch (error) {
        throw new Error(`Error getting collaboration data for user: ${error.message}`);
    }
};
//get collab data for mentor
export const getCollabDataForMentor = async (mentorId) => {
    try {
        const collabData = await Collaboration.find({ mentorId, isCancelled: false })
            .populate('mentorId')
            .populate("userId", "name email profilePic");
        return collabData;
    }
    catch (error) {
        throw new Error(`Error getting collaboration data for mentor: ${error.message}`);
    }
};
//FOR ADMIN
//Get All Requsets
export const findMentorRequest = async () => {
    try {
        return await MentorRequest.find()
            .populate({
            path: "mentorId",
            model: "Mentor",
            populate: {
                path: "userId",
                model: "User",
            },
        })
            .populate({
            path: "userId",
            model: "User",
        });
    }
    catch (error) {
        throw new Error(`Error fetching mentor request : ${error.message}`);
    }
};
//Get All Collab
export const findCollab = async () => {
    try {
        return await Collaboration.find()
            .populate({
            path: "mentorId",
            model: "Mentor",
            populate: {
                path: "userId",
                model: "User",
            },
        })
            .populate({
            path: "userId",
            model: "User",
        });
    }
    catch (error) {
        throw new Error("Error fetching collaborations: " + error.message);
    }
};
//get requset details
export const fetchMentorRequsetDetails = async (requsetId) => {
    try {
        return await MentorRequest.findById(requsetId)
            .populate({
            path: "mentorId",
            model: "Mentor",
            populate: {
                path: "userId",
                model: "User",
            },
        })
            .populate({
            path: "userId",
            model: "User",
        });
    }
    catch (error) {
        throw new Error(`Error fetching mentor request : ${error.message}`);
    }
};
//get collab details
export const findCollabDetails = async (collabId) => {
    try {
        return await Collaboration.findById(collabId)
            .populate({
            path: "mentorId",
            model: "Mentor",
            populate: {
                path: "userId",
                model: "User",
            },
        })
            .populate({
            path: "userId",
            model: "User",
        });
    }
    catch (error) {
        throw new Error("Error fetching collaboration Details: " + error.message);
    }
};
//# sourceMappingURL=collaboration.repositry.js.map