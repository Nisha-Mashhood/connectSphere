import * as MentorRepository from "../repositories/mentor.repositry.js";
import { sendEmail } from "../utils/email.utils.js";
// Function to submit a mentor request (for admin review)
export const submitMentorRequest = async (mentorData) => {
    try {
        // Save mentor data (pending admin approval)
        const newMentor = await MentorRepository.saveMentorRequest(mentorData);
        return newMentor;
    }
    catch (error) {
        throw new Error("Error saving mentor request: " + error.message);
    }
};
// Get all mentor requests
export const getAllMentorRequests = async () => {
    try {
        return await MentorRepository.getAllMentorRequests();
    }
    catch (error) {
        throw new Error("Error fetching mentor requests: " + error.message);
    }
};
// Approve a mentor request
export const approveMentorRequest = async (id) => {
    try {
        await MentorRepository.approveMentorRequest(id);
        // Fetch mentor data to send email
        const mentor = await MentorRepository.getMentorById(id);
        if (!mentor) {
            throw new Error("Mentor not found.");
        }
        if (typeof mentor.userId === "string") {
            throw new Error("User details are not populated.");
        }
        if (mentor) {
            const userEmail = mentor.userId.email;
            const userName = mentor.userId.name;
            await sendEmail(userEmail, "Mentor Request Approved", `Hello ${userName},\n\nCongratulations! Your mentor request has been approved.\n\nBest regards,\n Admin \n ConnectSphere`);
        }
    }
    catch (error) {
        throw new Error("Error approving mentor request: " + error.message);
    }
};
// Reject a mentor request
export const rejectMentorRequest = async (id, reason) => {
    try {
        await MentorRepository.rejectMentorRequest(id);
        // Fetch mentor data to send email
        const mentor = await MentorRepository.getMentorById(id);
        if (!mentor) {
            throw new Error("Mentor not found.");
        }
        if (typeof mentor.userId === "string") {
            throw new Error("User details are not populated.");
        }
        if (mentor) {
            const userEmail = mentor.userId.email;
            const userName = mentor.userId.name;
            await sendEmail(userEmail, "Mentor Request Rejected", `Hello ${userName},\n\nWe regret to inform you that your mentor request has been rejected.\n\nReason: ${reason}\n\nBest regards,\nAdmin \n ConnectSphere`);
        }
    }
    catch (error) {
        throw new Error("Error rejecting mentor request: " + error.message);
    }
};
// Cancel mentorship
export const cancelMentorship = async (id) => {
    try {
        // Update mentor status to "Cancelled"
        await MentorRepository.cancelMentorship(id);
        // Fetch mentor data to send email
        const mentor = await MentorRepository.getMentorById(id);
        if (!mentor) {
            throw new Error("Mentor not found.");
        }
        if (typeof mentor.userId === "string") {
            throw new Error("User details are not populated.");
        }
        if (mentor) {
            const userEmail = mentor.userId.email;
            const userName = mentor.userId.name;
            await sendEmail(userEmail, "Mentorship Cancelled", `Hello ${userName},\n\nWe regret to inform you that your mentorship has been cancelled by the admin. If you have any questions, please contact support.\n\nBest regards,\nAdmin \nConnectSphere`);
        }
    }
    catch (error) {
        throw new Error("Error cancelling mentorship: " + error.message);
    }
};
// Get mentor details by userId
export const getMentorByUserId = async (userId) => {
    try {
        return await MentorRepository.getMentorByUserId(userId);
    }
    catch (error) {
        throw new Error("Error fetching mentor details: " + error.message);
    }
};
// Update mentor details by mentorId
export const updateMentorById = async (mentorId, updateData) => {
    try {
        return await MentorRepository.updateMentorById(mentorId, updateData);
    }
    catch (error) {
        throw new Error("Error updating mentor details: " + error.message);
    }
};
// Get available skills
export const getSkills = async () => {
    try {
        return await MentorRepository.getSkills();
    }
    catch (error) {
        throw new Error("Error fetching skills: " + error.message);
    }
};
//# sourceMappingURL=mentor.service.js.map