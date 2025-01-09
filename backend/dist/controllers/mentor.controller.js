import * as MentorService from "../services/mentor.service.js";
import { uploadImage } from "../utils/cloudinary.utils.js";
import * as UserService from '../services/user.service.js';
export const checkMentorStatus = async (req, res) => {
    const userId = req.params.id;
    try {
        console.log("Received userId:", req.params.userId);
        const mentor = await MentorService.getMentorByUserId(userId);
        console.log(mentor);
        if (!mentor) {
            res.status(200).json({ mentor: null });
            return;
        }
        res.status(200).json({ mentor });
        return;
    }
    catch (error) {
        res.status(400).json({ message: "Error fetching mentor status", error: error.message });
        return;
    }
};
//fetch skills for mentor creation
export const getSkills = async (_, res) => {
    try {
        const skills = await MentorService.getSkills();
        res.status(200).json({ skills });
    }
    catch (error) {
        console.error('Error fetching skills:', error.message);
        res.status(500).json({ message: "Error fetching skills", error: error.message });
    }
};
//create mentor record
export const createMentor = async (req, res) => {
    const { userId, specialization, skills, availableSlots } = req.body;
    try {
        const user = await UserService.getUserById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        // Change the user's role to "mentor" if it's not already set to "mentor"
        if (user.role !== "mentor") {
            await UserService.changeRole(userId, "mentor");
        }
        // Check if mentor already exists
        const existingMentor = await MentorService.getMentorByUserId(userId);
        if (existingMentor) {
            res.status(400).json({ message: "Mentor profile already exists." });
            return;
        }
        // Check if certificates are provided and upload them to Cloudinary
        let uploadedCertificates = [];
        if (req.files && req.files.length > 0) {
            const files = req.files;
            const uploadPromises = files.map((file) => uploadImage(file.path, "mentor_certificates") // Upload each file to Cloudinary
            );
            uploadedCertificates = await Promise.all(uploadPromises); // Get URLs of uploaded certificates
        }
        else {
            res.status(400).json({ message: "Certificates are required for mentor registration." });
            return;
        }
        // Create mentor record (submit for admin review)
        const newMentor = await MentorService.submitMentorRequest({
            userId,
            skills: JSON.parse(skills),
            specialization,
            availableSlots: JSON.parse(availableSlots),
            certifications: uploadedCertificates,
        });
        console.log("newMentor", newMentor);
        res.status(201).json({
            message: "Mentor registration submitted successfully for admin review.",
            data: newMentor,
        });
        return;
    }
    catch (error) {
        console.error("Error registering mentor:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
        return;
    }
};
export const getAllMentorRequests = async (_req, res) => {
    try {
        const mentorRequests = await MentorService.getAllMentorRequests();
        res.json(mentorRequests);
    }
    catch (error) {
        console.error("Error fetching mentor requests:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};
// Get mentor by userId
export const getMentorByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const mentor = await MentorService.getMentorByUserId(userId);
        if (!mentor) {
            res.status(404).json({ message: "Mentor not found" });
            return;
        }
        res.json(mentor);
    }
    catch (error) {
        console.error("Error fetching mentor:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};
export const approveMentorRequest = async (req, res) => {
    try {
        await MentorService.approveMentorRequest(req.params.id);
        res.json({ message: "Mentor request approved successfully." });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const rejectMentorRequest = async (req, res) => {
    const { reason } = req.body;
    if (!reason) {
        res.status(400).json({ message: "Rejection reason is required." });
        return;
    }
    try {
        await MentorService.rejectMentorRequest(req.params.id, reason);
        res.json({ message: "Mentor request rejected successfully." });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
//# sourceMappingURL=mentor.controller.js.map