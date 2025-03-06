import { acceptRequest, fetchCollabById, fetchRequsetById, getCollabDataForMentorService, getCollabDataForUserService, getCollabsService, getMentorRequests, getMentorRequestsService, getRequsetForUser, processPaymentService, rejectRequest, removecollab, TemporaryRequestService, } from "../services/collaboration.service.js";
import mentorRequset from "../models/mentorRequset.js";
export const TemporaryRequestController = async (req, res) => {
    try {
        const { mentorId, userId, selectedSlot, price } = req.body;
        if (!mentorId || !userId || !selectedSlot || !price) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        const requestData = {
            mentorId,
            userId,
            selectedSlot,
            price,
        };
        const newRequest = await TemporaryRequestService(requestData);
        console.log(newRequest);
        res.status(201).json({
            message: "Request created successfully",
            request: newRequest,
        });
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
};
// Get all mentor requests for the logged-in mentor
export const getMentorRequestsController = async (req, res) => {
    const mentorId = req.query.mentorId;
    if (!mentorId) {
        res.status(400).json({ message: "Mentor ID is required." });
        return;
    }
    try {
        const mentorRequests = await getMentorRequests(mentorId);
        res.status(200).json({ requests: mentorRequests });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Accept a mentor request
export const acceptRequestController = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await acceptRequest(id);
        res.status(200).json({ message: "Request accepted", request });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Reject a mentor request
export const rejectRequestController = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await rejectRequest(id);
        res.status(200).json({ message: "Request rejected", request });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Get requset for user
export const getRequsetForUserController = async (req, res) => {
    try {
        const { id } = req.params;
        const userRequest = await getRequsetForUser(id);
        res
            .status(200)
            .json({
            message: "Request retrieved successfully",
            requests: userRequest,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//Make payemnt requset
export const makeStripePaymentController = async (req, res) => {
    const { token, amount, requestId } = req.body;
    try {
        // Retrieve the mentor request document
        const mentorRequestData = await mentorRequset.findById(requestId);
        if (!mentorRequestData) {
            res
                .status(404)
                .json({ status: "failure", message: "Mentor request not found" });
            return;
        }
        // Process payment and handle collaboration creation
        const paymentResult = await processPaymentService(token, amount, requestId, mentorRequestData);
        res.status(200).json({ status: "success", charge: paymentResult });
        return;
    }
    catch (error) {
        console.error("Payment error:", error.message);
        res.status(500).json({ status: "failure", error: error.message });
        return;
    }
};
//get collab data for user
export const getCollabDataForUserController = async (req, res) => {
    try {
        const userId = req.params.id;
        const collabData = await getCollabDataForUserService(userId);
        res.status(200).json({ collabData });
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
};
//Get collab data for mentor
export const getCollabDataForMentorController = async (req, res) => {
    try {
        const mentorId = req.params.id;
        const collabData = await getCollabDataForMentorService(mentorId);
        res.status(200).json({ collabData });
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
};
//delete collab
export const deleteCollab = async (req, res) => {
    const { collabId } = req.params;
    const { reason } = req.body;
    try {
        const response = await removecollab(collabId, reason);
        res.status(200).json({
            status: "success",
            message: "Collab deleted successfully",
            response,
        });
    }
    catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: "failure", error: error.message });
    }
};
//FOR ADMIN
// Get all mentor requests
export const getAllMentorRequests = async (_req, res) => {
    try {
        const mentorRequests = await getMentorRequestsService();
        res.status(200).json(mentorRequests);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Get all collaborations
export const getAllCollabs = async (_req, res) => {
    try {
        const collaborations = await getCollabsService();
        res.status(200).json(collaborations);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//get collab details by collabId
export const getCollabDeatilsbyCollabId = async (req, res) => {
    const { collabId } = req.params;
    try {
        const collabDetails = await fetchCollabById(collabId);
        res
            .status(200)
            .json({ message: "Collab details accessed successfully", data: collabDetails });
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
};
//get Requset deatils using requsetId
export const getRequestDeatilsbyRequestId = async (req, res) => {
    const { requestId } = req.params;
    try {
        const requestDetails = await fetchRequsetById(requestId);
        res
            .status(200)
            .json({ message: "Requset details accessed successfully", data: requestDetails });
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
};
//# sourceMappingURL=collaboration.controller.js.map