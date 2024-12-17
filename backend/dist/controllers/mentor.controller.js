import * as MentorService from "../services/mentor.service.js";
import { uploadImage } from "../utils/cloudinary.utils.js";
export const submitMentorRequest = async (req, res) => {
    const { userId, certificate } = req.body;
    // Upload certificate to Cloudinary
    const uploadedCertificate = await uploadImage(certificate, "mentor_certificates");
    const mentorRequest = await MentorService.submitMentorRequest({
        userId,
        certifications: [uploadedCertificate],
    });
    res.json(mentorRequest);
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