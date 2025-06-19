import { BaseController } from '../../../core/Controller/BaseController.js';
import { MentorService } from '../Service/Mentorservice.js';
import { AuthService } from '../../Auth/Service/AuthService.js';
import { UserRepository } from '../../Auth/Repositry/UserRepositry.js';
import { uploadMedia } from '../../../core/Utils/Cloudinary.js';
export class MentorController extends BaseController {
    mentorService;
    authService;
    userRepo;
    constructor() {
        super();
        this.mentorService = new MentorService();
        this.authService = new AuthService();
        this.userRepo = new UserRepository();
    }
    async checkMentorStatus(req, res) {
        try {
            const { id } = req.params;
            const mentor = await this.mentorService.getMentorByUserId(id);
            this.sendSuccess(res, { mentor: mentor || null }, 'Mentor status retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async getMentorDetails(req, res) {
        try {
            const { mentorId } = req.params;
            const mentor = await this.mentorService.getMentorByMentorId(mentorId);
            if (!mentor) {
                this.throwError(404, 'Mentor not found');
            }
            this.sendSuccess(res, { mentor }, 'Mentor details retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async createMentor(req, res) {
        try {
            const { userId, specialization, bio, price, skills, availableSlots, timePeriod } = req.body;
            const user = await this.userRepo.getUserById(userId);
            if (!user) {
                this.throwError(404, 'User not found');
            }
            if (user.role !== 'mentor') {
                await this.authService.changeRole(userId, 'mentor');
            }
            const existingMentor = await this.mentorService.getMentorByUserId(userId);
            if (existingMentor) {
                this.throwError(400, 'Mentor profile already exists');
            }
            let uploadedCertificates = [];
            if (req.files && Array.isArray(req.files) && req.files.length > 0) {
                const files = req.files;
                const uploadPromises = files.map((file) => uploadMedia(file.path, 'mentor_certificates', file.size).then((result) => result.url));
                uploadedCertificates = await Promise.all(uploadPromises);
            }
            else {
                this.throwError(400, 'Certificates are required for mentor registration');
            }
            const newMentor = await this.mentorService.submitMentorRequest({
                userId,
                skills: JSON.parse(skills),
                specialization,
                bio,
                price,
                availableSlots: JSON.parse(availableSlots),
                timePeriod,
                certifications: uploadedCertificates,
            });
            this.sendCreated(res, newMentor, 'Mentor registration submitted successfully for admin review');
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async getAllMentorRequests(req, res) {
        try {
            const { page = '1', limit = '10', search = '', status = '', sort = 'desc' } = req.query;
            const mentorRequests = await this.mentorService.getAllMentorRequests(parseInt(page), parseInt(limit), search, status, sort);
            this.sendSuccess(res, {
                mentors: mentorRequests.mentors,
                total: mentorRequests.total,
                currentPage: parseInt(page),
                totalPages: mentorRequests.pages,
            }, 'Mentor requests retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async getAllMentors(_req, res) {
        try {
            const mentors = await this.mentorService.getAllMentors();
            this.sendSuccess(res, mentors, 'Mentors retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async getMentorByUserId(req, res) {
        try {
            const { userId } = req.params;
            const mentor = await this.mentorService.getMentorByUserId(userId);
            if (!mentor) {
                this.throwError(404, 'Mentor not found');
            }
            this.sendSuccess(res, mentor, 'Mentor retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async approveMentorRequest(req, res) {
        try {
            const { id } = req.params;
            await this.mentorService.approveMentorRequest(id);
            this.sendSuccess(res, null, 'Mentor request approved successfully. Email sent to user');
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async rejectMentorRequest(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            if (!reason) {
                this.throwError(400, 'Rejection reason is required');
            }
            await this.mentorService.rejectMentorRequest(id, reason);
            this.sendSuccess(res, null, 'Mentor request rejected successfully. Email sent to user');
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async cancelMentorship(req, res) {
        try {
            const { mentorId } = req.params;
            await this.mentorService.cancelMentorship(mentorId);
            this.sendSuccess(res, null, 'Mentorship cancelled successfully. Email sent to user');
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async updateMentorProfile(req, res) {
        try {
            const { mentorId } = req.params;
            const updateData = req.body;
            const mentorData = await this.mentorService.updateMentorById(mentorId, updateData);
            this.sendSuccess(res, mentorData, 'Mentor profile updated successfully');
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
}
//# sourceMappingURL=Mentorcontroller.js.map