import { BaseService } from "../../../core/Services/BaseService.js";
import { MentorRepository } from "../Repositry/MentorRepositry.js";
import { UserRepository } from "../../Auth/Repositry/UserRepositry.js";
import { sendEmail } from "../../../core/Utils/Email.js";
import logger from "../../../core/Utils/Logger.js";
import { IMentor } from "../../../Interfaces/models/IMentor.js";

export class MentorService extends BaseService {
  private mentorRepo: MentorRepository;
  private authRepo: UserRepository;

  constructor() {
    super();
    this.mentorRepo = new MentorRepository();
    this.authRepo = new UserRepository();
  }

  async submitMentorRequest(mentorData: {
    userId: string;
    skills: string[];
    specialization: string;
    bio: string;
    price: number;
    availableSlots: object[];
    timePeriod: number;
    certifications: string[];
  }): Promise<IMentor> {
    logger.debug(`Submitting mentor request for user: ${mentorData.userId}`);
    this.checkData(mentorData);
    return await this.mentorRepo.saveMentorRequest(mentorData);
  }

  async getAllMentorRequests(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    status: string = "",
    sort: string = "desc"
  ): Promise<{
    mentors: IMentor[];
    total: number;
    page: number;
    pages: number;
  }> {
    logger.debug(`Fetching mentor requests`);
    return await this.mentorRepo.getAllMentorRequests(
      page,
      limit,
      search,
      status,
      sort
    );
  }

  async getAllMentors(): Promise<IMentor[]> {
    logger.debug(`Fetching all approved mentors`);
    return await this.mentorRepo.getAllMentors();
  }

  async getMentorByMentorId(mentorId: string): Promise<IMentor | null> {
    logger.debug(`Fetching mentor by ID: ${mentorId}`);
    this.checkData(mentorId);
    return await this.mentorRepo.getMentorDetails(mentorId);
  }

  async approveMentorRequest(id: string): Promise<void> {
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

    await sendEmail(
      user.email,
      "Mentor Request Approved",
      `Hello ${user.name},\n\nCongratulations! Your mentor request has been approved.\n\nBest regards,\n Admin \n ConnectSphere`
    );
  }

  async rejectMentorRequest(id: string, reason: string): Promise<void> {
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
    await sendEmail(
      user.email,
      "Mentor Request Rejected",
      `Hello ${user.name},\n\nWe regret to inform you that your mentor request has been rejected.\n\nReason: ${reason}\n\nBest regards,\nAdmin\nConnectSphere`
    );
  }

  async cancelMentorship(id: string): Promise<void> {
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
    await sendEmail(
      user.email,
      "Mentorship Cancelled",
      `Hello ${user.name},\n\nWe regret to inform you that your mentorship has been cancelled by the admin. If you have any questions, please contact support.\n\nBest regards,\nAdmin\nConnectSphere`
    );
  }

  async getMentorByUserId(userId: string): Promise<IMentor | null> {
    logger.debug(`Fetching mentor by user ID: ${userId}`);
    this.checkData(userId);
    return await this.mentorRepo.getMentorByUserId(userId);
  }

  async updateMentorById(
    mentorId: string,
    updateData: Partial<IMentor>
  ): Promise<IMentor | null> {
    logger.debug(`Updating mentor: ${mentorId}`);
    this.checkData({ mentorId, updateData });
    const mentor = await this.mentorRepo.getMentorById(mentorId);
    if (!mentor) {
      this.throwError("Mentor not found");
    }
    return await this.mentorRepo.updateMentorById(mentorId, updateData);
  }
}
