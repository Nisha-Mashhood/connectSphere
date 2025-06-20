import { Request, Response } from 'express';
import { BaseController } from '../../../core/Controller/BaseController.js';
import { MentorService } from '../Service/Mentorservice.js';
import { AuthService } from '../../Auth/Service/AuthService.js';
import { UserRepository } from '../../Auth/Repositry/UserRepositry.js';
import { uploadMedia } from '../../../core/Utils/Cloudinary.js';


export class MentorController extends BaseController {
  private mentorService: MentorService;
  private authService: AuthService;
  private userRepo: UserRepository;

  constructor() {
    super();
    this.mentorService = new MentorService();
    this.authService = new AuthService();
    this.userRepo = new UserRepository();
  }

   checkMentorStatus  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { id } = req.params;
      const mentor = await this.mentorService.getMentorByUserId(id);
      this.sendSuccess(res, { mentor: mentor || null }, 'Mentor status retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

   getMentorDetails  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { mentorId } = req.params;
      const mentor = await this.mentorService.getMentorByMentorId(mentorId);
      if (!mentor) {
        this.throwError(404, 'Mentor not found');
      }
      this.sendSuccess(res, { mentor }, 'Mentor details retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

   createMentor  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { userId, specialization, bio, price, skills, availableSlots, timePeriod } = req.body;

      const user = await this.userRepo.getUserById(userId);
      if (!user) {
        this.throwError(404, 'User not found');
      }

      if (user?.role !== 'mentor') {
        await this.authService.changeRole(userId, 'mentor');
      }

      const existingMentor = await this.mentorService.getMentorByUserId(userId);
      if (existingMentor) {
        this.throwError(400, 'Mentor profile already exists');
      }

      let uploadedCertificates: string[] = [];
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const files = req.files as Express.Multer.File[];
        const uploadPromises = files.map((file) =>
          uploadMedia(file.path, 'mentor_certificates', file.size).then((result) => result.url)
        );
        uploadedCertificates = await Promise.all(uploadPromises);
      } else {
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
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

   getAllMentorRequests  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { page = '1', limit = '10', search = '', status = '', sort = 'desc' } = req.query;
      const mentorRequests = await this.mentorService.getAllMentorRequests(
        parseInt(page as string),
        parseInt(limit as string),
        search as string,
        status as string,
        sort as string
      );
      this.sendSuccess(res, {
        mentors: mentorRequests.mentors,
        total: mentorRequests.total,
        currentPage: parseInt(page as string),
        totalPages: mentorRequests.pages,
      }, 'Mentor requests retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

   getAllMentors = async(_req: Request, res: Response): Promise<void> =>{
    try {
      const mentors = await this.mentorService.getAllMentors();
      this.sendSuccess(res, mentors, 'Mentors retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

   getMentorByUserId  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { userId } = req.params;
      const mentor = await this.mentorService.getMentorByUserId(userId);
      if (!mentor) {
        this.throwError(404, 'Mentor not found');
      }
      this.sendSuccess(res, mentor, 'Mentor retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

   approveMentorRequest  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { id } = req.params;
      await this.mentorService.approveMentorRequest(id);
      this.sendSuccess(res, null, 'Mentor request approved successfully. Email sent to user');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

   rejectMentorRequest  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { id } = req.params;
      const { reason } = req.body;
      if (!reason) {
        this.throwError(400, 'Rejection reason is required');
      }
      await this.mentorService.rejectMentorRequest(id, reason);
      this.sendSuccess(res, null, 'Mentor request rejected successfully. Email sent to user');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

   cancelMentorship  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { mentorId } = req.params;
      await this.mentorService.cancelMentorship(mentorId);
      this.sendSuccess(res, null, 'Mentorship cancelled successfully. Email sent to user');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

   updateMentorProfile  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { mentorId } = req.params;
      const updateData = req.body;
      const mentorData = await this.mentorService.updateMentorById(mentorId, updateData);
      this.sendSuccess(res, mentorData, 'Mentor profile updated successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }
}