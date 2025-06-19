import { BaseService } from "../../../core/Services/BaseService.js";
import { MentorRepository } from "../Repositry/MentorRepositry.js";
import { UserRepository } from "../../Auth/Repositry/UserRepositry.js";
import { sendEmail } from "../../../core/Utils/Email.js";
import logger from "../../../core/Utils/Logger.js";
export class MentorService extends BaseService {
    mentorRepo;
    authRepo;
    constructor() {
        super();
        this.mentorRepo = new MentorRepository();
        this.authRepo = new UserRepository();
    }
    async submitMentorRequest(mentorData) {
        logger.debug(`Submitting mentor request for user: ${mentorData.userId}`);
        this.checkData(mentorData);
        return await this.mentorRepo.saveMentorRequest(mentorData);
    }
    async getAllMentorRequests(page = 1, limit = 10, search = "", status = "", sort = "desc") {
        logger.debug(`Fetching mentor requests`);
        return await this.mentorRepo.getAllMentorRequests(page, limit, search, status, sort);
    }
    async getAllMentors() {
        logger.debug(`Fetching all approved mentors`);
        return await this.mentorRepo.getAllMentors();
    }
    async getMentorByMentorId(mentorId) {
        logger.debug(`Fetching mentor by ID: ${mentorId}`);
        this.checkData(mentorId);
        return await this.mentorRepo.getMentorDetails(mentorId);
    }
    async approveMentorRequest(id) {
        logger.debug(`Approving mentor request: ${id}`);
        this.checkData(id);
        const mentor = await this.mentorRepo.approveMentorRequest(id);
        if (!mentor) {
            this.throwError("Mentor not found");
        }
        const user = await this.authRepo.getUserById(mentor.userId.toString());
        if (!user) {
            this.throwError("User not found");
        }
        await sendEmail(user.email, "Mentor Request Approved", `Hello ${user.name},\n\nCongratulations! Your mentor request has been approved.\n\nBest regards,\n Admin \n ConnectSphere`);
    }
    async rejectMentorRequest(id, reason) {
        logger.debug(`Rejecting mentor request: ${id}`);
        this.checkData({ id, reason });
        const mentor = await this.mentorRepo.rejectMentorRequest(id);
        if (!mentor) {
            this.throwError("Mentor not found");
        }
        const user = await this.authRepo.getUserById(mentor.userId.toString());
        if (!user) {
            this.throwError("User not found");
        }
        await sendEmail(user.email, "Mentor Request Rejected", `Hello ${user.name},\n\nWe regret to inform you that your mentor request has been rejected.\n\nReason: ${reason}\n\nBest regards,\nAdmin\nConnectSphere`);
    }
    async cancelMentorship(id) {
        logger.debug(`Cancelling mentorship: ${id}`);
        this.checkData(id);
        const mentor = await this.mentorRepo.cancelMentorship(id);
        if (!mentor) {
            this.throwError("Mentor not found");
        }
        const user = await this.authRepo.getUserById(mentor.userId.toString());
        if (!user) {
            this.throwError("User not found");
        }
        await sendEmail(user.email, "Mentorship Cancelled", `Hello ${user.name},\n\nWe regret to inform you that your mentorship has been cancelled by the admin. If you have any questions, please contact support.\n\nBest regards,\nAdmin\nConnectSphere`);
    }
    async getMentorByUserId(userId) {
        logger.debug(`Fetching mentor by user ID: ${userId}`);
        this.checkData(userId);
        return await this.mentorRepo.getMentorByUserId(userId);
    }
    async updateMentorById(mentorId, updateData) {
        logger.debug(`Updating mentor: ${mentorId}`);
        this.checkData({ mentorId, updateData });
        const mentor = await this.mentorRepo.getMentorById(mentorId);
        if (!mentor) {
            this.throwError("Mentor not found");
        }
        return await this.mentorRepo.updateMentorById(mentorId, updateData);
    }
}
//# sourceMappingURL=Mentorservice.js.map