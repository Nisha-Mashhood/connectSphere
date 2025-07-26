import { Types, Model } from "mongoose";
import { BaseRepository } from "../../../core/Repositries/BaseRepositry";
import { RepositoryError } from "../../../core/Utils/ErrorHandler";
import logger from "../../../core/Utils/Logger";
import Mentor from "../../../models/mentor.model";
import { IMentor } from "../../../Interfaces/models/IMentor";
import { UserInterface } from "../../../Interfaces/models/IUser";
import { MentorQuery } from "../Types/Types";

export class MentorRepository extends BaseRepository<IMentor> {
  constructor() {
    super(Mentor as Model<IMentor>);
  }

  private toObjectId(id?: string | Types.ObjectId | UserInterface): Types.ObjectId {
    if (!id) {
      logger.error('Missing ID');
      throw new RepositoryError('Invalid ID: ID is required');
    }
    let idStr: string;
    if (typeof id === 'string') {
      idStr = id;
    } else if (id instanceof Types.ObjectId) {
      idStr = id.toString();
    } else if (typeof id === 'object' && '_id' in id) {
      idStr = (id as UserInterface)._id.toString();
    } else {
      logger.error(`Invalid ID type: ${typeof id}`);
      throw new RepositoryError('Invalid ID: must be a string, ObjectId, or UserInterface');
    }
    if (!Types.ObjectId.isValid(idStr)) {
      logger.error(`Invalid ID: ${idStr}`);
      throw new RepositoryError('Invalid ID: must be a 24 character hex string');
    }
    return new Types.ObjectId(idStr);
  }

   submitMentorRequest = async(data: Partial<IMentor>): Promise<IMentor> => {
    try {
      logger.debug(`Submitting mentor request for user: ${data.userId}`);
      return await this.create({
        ...data,
        userId: this.toObjectId(data.userId),
      });
    } catch (error: any) {
      logger.error(`Error submitting mentor request: ${error.message}`);
      throw new RepositoryError(
        `Error submitting mentor request: ${error.message}`
      );
    }
  }

   getAllMentorRequests = async(
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
  }> => {
    try {
      logger.debug(
        `Fetching mentor requests with page: ${page}, limit: ${limit}, search: ${search}`
      );
      const query: any = {};
      if (status) query.isApproved = status;
      if (search) {
        query.$or = [
          { "userId.name": { $regex: search, $options: "i" } },
          { "userId.email": { $regex: search, $options: "i" } },
        ];
      }
      const total = await this.model.countDocuments(query);
      const mentors = await this.model
        .find(query)
        .populate("userId", "name email")
        .populate("skills", "name")
        .sort({ createdAt: sort === "desc" ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      return { mentors, total, page, pages: Math.ceil(total / limit) };
    } catch (error: any) {
      logger.error(`Error fetching mentor requests: ${error.message}`);
      throw new RepositoryError(
        `Error fetching mentor requests: ${error.message}`
      );
    }
  }

  getAllMentors = async (query: MentorQuery = {}): Promise<{ mentors: IMentor[]; total: number }> => {
    try {
      logger.debug(`Fetching all approved mentors with query: ${JSON.stringify(query)}`);
      const { search, page, limit, skill } = query;

      // If no query parameters, return all mentors without pagination
      if (!search && !page && !limit && !skill) {
        const mentors = await this.model
          .find({ isApproved: "Completed" })
          .populate("userId")
          .populate("skills")
          .exec();
        logger.info(`Fetched ${mentors.length} mentors (no query constraints)`);
        return { mentors, total: mentors.length };
      }

      // Build aggregation pipeline for search, filtering, and pagination
      const matchStage: any = { isApproved: "Completed" };
      if (search) {
        matchStage["userId.name"] = { $regex: `^${search}`, $options: "i" };
      }
      if (skill) {
        matchStage.skills = { $in: [skill] };
      }

      const pipeline = [
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        { $unwind: "$userId" },
        {
          $lookup: {
            from: "skills",
            localField: "skills",
            foreignField: "_id",
            as: "skills",
          },
        },
        { $match: matchStage },
        {
          $facet: {
            mentors: [
              { $skip: ((page || 1) - 1) * (limit || 10) },
              { $limit: limit || 10 },
            ],
            total: [{ $count: "count" }],
          },
        },
      ];

      const result = await this.model.aggregate(pipeline).exec();
      const mentors = result[0]?.mentors || [];
      const total = result[0]?.total[0]?.count || 0;

      logger.info(`Fetched ${mentors.length} mentors, total: ${total}`);
      return { mentors, total };
    } catch (error: any) {
      logger.error(`Error fetching mentors: ${error.message}`);
      throw new RepositoryError(`Error fetching mentors: ${error.message}`);
    }
  }

   getMentorDetails = async(id: string): Promise<IMentor | null> => {
    try {
      logger.debug(`Fetching mentor details for ID: ${id}`);
      return await this.model
        .findById(this.toObjectId(id))
        .populate("userId")
        .populate("skills")
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching mentor details: ${error.message}`);
      throw new RepositoryError(
        `Error fetching mentor details: ${error.message}`
      );
    }
  }

   approveMentorRequest = async(id: string): Promise<IMentor> => {
    try {
      logger.debug(`Approving mentor request: ${id}`);
      const updatedMentor = await this.model
        .findByIdAndUpdate(
          this.toObjectId(id),
          { isApproved: "Completed" },
          { new: true }
        )
        .lean();
        if(!updatedMentor){
          throw new RepositoryError(`Error approving mentor request`)
        }
        return updatedMentor
    } catch (error: any) {
      logger.error(`Error approving mentor request: ${error.message}`);
      throw new RepositoryError(
        `Error approving mentor request: ${error.message}`
      );
    }
  }

   rejectMentorRequest = async(id: string): Promise<IMentor | null> => {
    try {
      logger.debug(`Rejecting mentor request: ${id}`);
      return await this.model
        .findByIdAndUpdate(
          this.toObjectId(id),
          { isApproved: "Rejected" },
          { new: true }
        )
        .lean();
    } catch (error: any) {
      logger.error(`Error rejecting mentor request: ${error.message}`);
      throw new RepositoryError(
        `Error rejecting mentor request: ${error.message}`
      );
    }
  }

   cancelMentorship = async(id: string): Promise<IMentor | null> => {
    try {
      logger.debug(`Cancelling mentorship: ${id}`);
      return await this.model
        .findByIdAndUpdate(
          this.toObjectId(id),
          { isApproved: "Processing" },
          { new: true }
        )
        .lean();
    } catch (error: any) {
      logger.error(`Error cancelling mentorship: ${error.message}`);
      throw new RepositoryError(
        `Error cancelling mentorship: ${error.message}`
      );
    }
  }

   getMentorById = async(id: string): Promise<IMentor | null> => {
    try {
      logger.debug(`Fetching mentor by ID: ${id}`);
      return await this.model
        .findById(this.toObjectId(id))
        .populate("userId", "name email")
        .populate("skills", "name")
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching mentor by ID: ${error.message}`);
      throw new RepositoryError(
        `Error fetching mentor by ID: ${error.message}`
      );
    }
  }

   getMentorByUserId = async(userId: string): Promise<IMentor | null> => {
    try {
      logger.debug(`Fetching mentor by user ID: ${userId}`);
      return await this.model
        .findOne({ userId: this.toObjectId(userId) })
        .populate("userId")
        .populate("skills")
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching mentor by user ID: ${error.message}`);
      throw new RepositoryError(
        `Error fetching mentor by user ID: ${error.message}`
      );
    }
  }

   updateMentorById = async(
    mentorId: string,
    updateData: Partial<IMentor>
  ): Promise<IMentor | null> =>{
    try {
      logger.debug(`Updating mentor: ${mentorId}`);
      return await this.findByIdAndUpdate(mentorId, updateData, { new: true });
    } catch (error: any) {
      logger.error(`Error updating mentor: ${error.message}`);
      throw new RepositoryError(`Error updating mentor: ${error.message}`);
    }
  }

   saveMentorRequest = async(data: {
    userId: string;
    skills: string[];
    specialization: string;
    bio: string;
    price: number;
    availableSlots: object[];
    timePeriod: number;
    certifications: string[];
  }): Promise<IMentor> =>{
    try {
      logger.debug(`Saving mentor request for user: ${data.userId}`);
      return await this.create({
        ...data,
        userId: data.userId ? this.toObjectId(data.userId) : undefined,
      });
    } catch (error: any) {
      logger.error(`Error saving mentor request: ${error.message}`);
      throw new RepositoryError(
        `Error saving mentor request: ${error.message}`
      );
    }
  }
  
}
