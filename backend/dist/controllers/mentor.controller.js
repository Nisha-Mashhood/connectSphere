import * as MentorService from "../services/mentor.service.js";
import { uploadImage } from "../utils/cloudinary.utils.js";
export const submitMentorRequest = async (req, res) => {
    const { userId, skills, specialization } = req.body;
    try {
        // Check if mentor already exists
        const existingMentor = await MentorService.getMentorByUserId(userId);
        if (existingMentor) {
            res.status(400).json({ message: "Mentor profile already exists." });
            return;
        }
        // Upload certificates
        let uploadedCertificates = [];
        if (req.files && req.files.length > 0) {
            const files = req.files;
            const uploadPromises = files.map((file) => uploadImage(file.path, "mentor_certificates"));
            uploadedCertificates = await Promise.all(uploadPromises);
        }
        else {
            res.status(400).json({ message: "Certificates are required for mentor registration." });
            return;
        }
        // Create mentor record
        const newMentor = await MentorService.submitMentorRequest({
            userId,
            skills,
            specialization,
            certifications: uploadedCertificates,
            isApproved: false,
        });
        res.status(201).json({
            message: "Mentor registration submitted successfully for admin review.",
            data: newMentor,
        });
    }
    catch (error) {
        console.error("Error registering mentor:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};
//update available slots for mentors in the profile section of mentors
export const updateAvailableSlots = async (req, res) => {
    const { availableSlots } = req.body;
    try {
        const updatedMentor = await MentorService.updateMentorById(req.params.mentorId, {
            availableSlots,
        });
        if (!updatedMentor) {
            res.status(404).json({ message: "Mentor not found." });
            return;
        }
        res.status(200).json({
            message: "Available slots updated successfully.",
            data: updatedMentor,
        });
    }
    catch (error) {
        console.error("Error updating available slots:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};
export const getAllMentorRequests = async (_req, res) => {
    const mentorRequests = await MentorService.getAllMentorRequests();
    res.json(mentorRequests);
};
export const approveMentorRequest = async (req, res) => {
    await MentorService.approveMentorRequest(req.params.id);
    res.json({ message: "Mentor request approved successfully" });
};
export const rejectMentorRequest = async (req, res) => {
    await MentorService.rejectMentorRequest(req.params.id);
    res.json({ message: "Mentor request rejected successfully" });
};
//# sourceMappingURL=mentor.controller.js.map