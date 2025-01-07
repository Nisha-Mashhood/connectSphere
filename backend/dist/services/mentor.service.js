import * as MentorRepository from "../repositories/mentor.repositry.js";
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
export const getAllMentorRequests = MentorRepository.getAllMentorRequests;
export const approveMentorRequest = MentorRepository.approveMentorRequest;
export const rejectMentorRequest = MentorRepository.rejectMentorRequest;
export const getMentorByUserId = MentorRepository.getMentorByUserId;
export const updateMentorById = MentorRepository.updateMentorById;
export const getSkills = async () => {
    return await MentorRepository.getSkills();
};
//# sourceMappingURL=mentor.service.js.map