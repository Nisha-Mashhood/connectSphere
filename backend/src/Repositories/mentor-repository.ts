import { injectable } from "inversify";
import { Types, Model } from "mongoose";
import { BaseRepository } from "../core/repositries/base-repositry";
import { RepositoryError } from "../core/utils/error-handler";
import logger from "../core/utils/logger";
import Mentor from "../Models/mentor-model";
import { IMentor } from "../Interfaces/Models/i-mentor";
import { IUser } from "../Interfaces/Models/i-user";
import { CompleteMentorDetails, MentorQuery } from "../Utils/types/mentor-types";
import { StatusCodes } from "../enums/status-code-enums";
import { IMentorRepository } from "../Interfaces/Repository/i-mentor-repositry";
import { ClientSession } from "mongoose";

@injectable()
export class MentorRepository extends BaseRepository<IMentor> implements IMentorRepository {
  constructor() {
    super(Mentor as Model<IMentor>);
  }

  private toObjectId = (id?: string | Types.ObjectId | IUser): Types.ObjectId => {
    if (!id) {
      logger.warn('Missing ID when converting to ObjectId');
      throw new RepositoryError('Invalid ID: ID is required', StatusCodes.BAD_REQUEST);
    }
    let idStr: string;
    if (typeof id === 'string') {
      idStr = id;
    } else if (id instanceof Types.ObjectId) {
      idStr = id.toString();
    } else if (typeof id === 'object' && '_id' in id) {
      idStr = (id as IUser)._id.toString();
    } else {
      logger.warn(`Invalid ID type: ${typeof id}`);
      throw new RepositoryError('Invalid ID: must be a string, ObjectId', StatusCodes.BAD_REQUEST);
    }
    if (!Types.ObjectId.isValid(idStr)) {
      logger.warn(`Invalid ObjectId format: ${idStr}`);
      throw new RepositoryError('Invalid ID: must be a 24 character hex string', StatusCodes.BAD_REQUEST);
    }
    return new Types.ObjectId(idStr);
  }

  // public submitMentorRequest = async (data: Partial<IMentor>, options?: { session?: ClientSession }): Promise<IMentor> => {
  //   try {
  //     logger.debug(`Submitting mentor request for user: ${data.userId}`);
  //     const mentor = await this.create({
  //       ...data,
  //       userId: this.toObjectId(data.userId),
  //     }, options?.session);
  //     logger.info(`Mentor request submitted: ${mentor._id}`);
  //     return mentor;
  //   } catch (error: unknown) {
  //     const err = error instanceof Error ? error : new Error(String(error));
  //     logger.error(`Error submitting mentor request for user ${data.userId}`, err);
  //     throw new RepositoryError('Error submitting mentor request', StatusCodes.INTERNAL_SERVER_ERROR, err);
  //   }
  // }

   public saveMentorRequest = async (data: {
    userId: string;
    skills: string[];
    specialization: string;
    bio: string;
    price: number;
    availableSlots: object[];
    timePeriod: number;
    certifications: string[];
  }, options?: { session?: ClientSession }): Promise<IMentor> => {
    try {
      logger.debug(`Saving mentor request for user: ${data.userId}`);
      const mentor = await this.create({
        ...data,
        userId: this.toObjectId(data.userId),
      }, options?.session);
      logger.info(`Mentor request saved: ${mentor._id}`);
      return mentor;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error saving mentor request for user ${data.userId}`, err);
      throw new RepositoryError('Error saving mentor request', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

 public getAllMentorRequests = async (
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
      `Fetching mentor requests: page=${page}, limit=${limit}, search="${search}", status="${status}"`
    );

    const pipeline: any[] = [];

    const match: any = {};
    if (status) match.isApproved = status;
    pipeline.push({ $match: match });

    pipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: 'userId',
      },
    });
    pipeline.push({ $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } });

    pipeline.push({
      $lookup: {
        from: "skills",
        localField: "skills",
        foreignField: "_id",
        as: 'skills',
      },
    });

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "userId.name": { $regex: search, $options: "i" } },
            { "userId.email": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $sort: { createdAt: sort === "desc" ? -1 : 1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              id: "$_id",
              mentorId: 1,
              userId: 1,
              isApproved: 1,
              rejectionReason: 1,
              bio: 1,
              price: 1,
              timePeriod: 1,
              availableSlots: 1,
              certifications: 1,
              specialization: 1,
              createdAt: 1,
              updatedAt: 1,
              skills: 1,
            },
          },
        ],
      },
    });

    const [result] = await this.model.aggregate(pipeline).exec();

    const total = result.metadata[0]?.total ?? 0;
    const mentors = result.data ?? [];

    logger.info(`Fetched ${mentors.length} mentors, total: ${total}`);

    return {
      mentors,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Error fetching mentor requests", err);
    throw new RepositoryError(
      "Error fetching mentor requests",
      StatusCodes.INTERNAL_SERVER_ERROR,
      err
    );
  }
};

  public getAllMentors = async (
    query: MentorQuery = {}
  ): Promise<{ mentors: CompleteMentorDetails[]; total: number }> => {
    try {
      logger.debug(`Fetching all approved mentors with query: ${JSON.stringify(query)}`);
      const {
        search,
        page = 1,
        limit = 10,
        skill,
        category,
        sortBy = "feedbackCount",
        sortOrder = "desc",
        excludeMentorId,
      } = query;

      logger.info(`Selected category: ${category || 'None'}, Skill: ${skill || 'None'}`);

      const matchStage: Record<string, any> = { isApproved: 'Completed' };
      if (search) {
        matchStage['userId.name'] = { $regex: search, $options: 'i' };
      }
      if (excludeMentorId) {
        logger.info(`Excluded mentorId: ${excludeMentorId}`);
        matchStage['_id'] = { $ne: this.toObjectId(excludeMentorId) };
      }

      const pipeline: any[] = [
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
            pipeline: [{ $project: { id : 1, name: 1, email: 1, profilePic: 1 } }],
          },
        },
        { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'skills',
            localField: 'skills',
            foreignField: '_id',
            as: 'skills',
            pipeline: [{ $project: { id: 1, name: 1, subcategoryId: 1 } }],
          },
        },
        {
          $lookup: {
            from: 'feedbacks',
            localField: '_id',
            foreignField: 'mentorId',
            as: 'feedbacks',
          },
        },
        {
          $addFields: {
            avgRating: { $avg: '$feedbacks.rating' },
            feedbackCount: { $size: '$feedbacks' },
          },
        },
      ];

      if (skill || category) {
        pipeline.push({
          $lookup: {
            from: 'subcategories',
            localField: 'skills.subcategoryId',
            foreignField: '_id',
            as: 'subcategories',
          },
        });
        pipeline.push({
          $lookup: {
            from: 'categories',
            localField: 'subcategories.categoryId',
            foreignField: '_id',
            as: 'categories',
          },
        });

        const filterStage: Record<string, any> = {};
        if (skill) {
          filterStage['skills.name'] = { $regex: `^${skill}$`, $options: 'i' };
          logger.info(`Applying skill filter: ${skill}`);
        }
        if (category) {
          filterStage['categories.name'] = { $regex: `^${category}$`, $options: 'i' };
          logger.info(`Applying category filter: ${category}`);
        }
        if (skill || category) {
          pipeline.push({ $match: filterStage });
        }
      }

      pipeline.push({ $match: matchStage });

      pipeline.push({
      $addFields: {
        id: '$_id',
      },
    });

      pipeline.push({
        $project: {
          _id: 0,
          id: 1,
          'userId._id':1,
          'userId.name': 1,
          'userId.email': 1,
          'userId.profilePic': 1,
          'skills._id': 1,
          'skills.name': 1,
          'skills.subcategoryId': 1,
          'categories.name': 1,
          price: 1,
          avgRating: 1,
          feedbackCount: 1,
          specialization: 1,
          timePeriod: 1,
          availableSlots: 1,
        },
      });

      const sortStage: Record<string, any> = {};
      if (sortBy === 'rating') {
        sortStage.avgRating = sortOrder === 'asc' ? 1 : -1;
        sortStage.feedbackCount = -1;
      } else if (sortBy === 'price') {
        sortStage.price = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'feedbackCount') {
        sortStage.feedbackCount = sortOrder === 'asc' ? 1 : -1;
        sortStage.avgRating = -1;
      } else {
        sortStage['userId.name'] = sortOrder === 'asc' ? 1 : -1;
      }
      pipeline.push({ $sort: sortStage });

      pipeline.push({
        $facet: {
          mentors: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          total: [{ $count: 'count' }],
        },
      });
      const result = await this.model.aggregate(pipeline).exec();
      const mentors = result[0]?.mentors || [];
      const total = result[0]?.total[0]?.count || 0;

      logger.info(`Fetched ${mentors.length} mentors, total: ${total}`);
      return { mentors, total };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching mentors`, err);
      throw new RepositoryError('Error fetching mentors', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public getMentorDetails = async (id: string): Promise<IMentor | null> => {
    try {
      logger.debug(`Fetching mentor details for ID: ${id}`);
      const mentor = await this.model
        .findById(this.toObjectId(id))
        .populate("userId")
        .populate("skills")
        .exec();
      logger.info(`Mentor details ${mentor ? 'found' : 'not found'}: ${id}`);
      return mentor;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching mentor details for ID ${id}`, err);
      throw new RepositoryError('Error fetching mentor details', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public approveMentorRequest = async (id: string): Promise<IMentor | null> => {
    try {
      logger.debug(`Approving mentor request: ${id}`);
      const updatedMentor = await this.model
        .findByIdAndUpdate(
          this.toObjectId(id),
          { isApproved: "Completed" },
          { new: true }
        )
        .exec();
      if (!updatedMentor) {
        logger.warn(`Mentor not found: ${id}`);
        throw new RepositoryError(`Mentor not found with ID: ${id}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Mentor request approved: ${id}`);
      return updatedMentor;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error approving mentor request for ID ${id}`, err);
      throw new RepositoryError('Error approving mentor request', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public rejectMentorRequest = async (id: string): Promise<IMentor | null> => {
    try {
      logger.debug(`Rejecting mentor request: ${id}`);
      const updatedMentor = await this.model
        .findByIdAndUpdate(
          this.toObjectId(id),
          { isApproved: "Rejected" },
          { new: true }
        )
        .exec();
      if (!updatedMentor) {
        logger.warn(`Mentor not found: ${id}`);
        throw new RepositoryError(`Mentor not found with ID: ${id}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Mentor request rejected: ${id}`);
      return updatedMentor;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error rejecting mentor request for ID ${id}`, err);
      throw new RepositoryError('Error rejecting mentor request', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public cancelMentorship = async (id: string, options?: { session?: ClientSession }): Promise<IMentor | null> => {
    try {
      logger.debug(`Cancelling mentorship: ${id}`);
      const updatedMentor = await this.model
        .findByIdAndUpdate(
          this.toObjectId(id),
          { isApproved: "Processing" },
          { new: true, session: options?.session }
        )
        .exec();
      if (!updatedMentor) {
        logger.warn(`Mentor not found: ${id}`);
        throw new RepositoryError(`Mentor not found with ID: ${id}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Mentorship cancelled: ${id}`);
      return updatedMentor;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error cancelling mentorship for ID ${id}`, err);
      throw new RepositoryError('Error cancelling mentorship', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public getMentorById = async (id: string): Promise<IMentor | null> => {
    try {
      logger.debug(`Fetching mentor by ID: ${id}`);
      const mentor = await this.model
        .findById(this.toObjectId(id))
        .populate("userId", "_id name email profilePic coverPic")
        .populate("skills", "_id name")
        .exec();
      logger.info(`Mentor ${mentor ? 'found' : 'not found'}: ${id}`);
      return mentor;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching mentor by ID ${id}`, err);
      throw new RepositoryError('Error fetching mentor by ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public getMentorByUserId = async (userId: string): Promise<IMentor | null> => {
    try {
      logger.debug(`Fetching mentor by user ID: ${userId}`);
      const mentor = await this.model
        .findOne({ userId: this.toObjectId(userId) })
        .populate("userId")
        .populate("skills")
        .exec();
      logger.info(`Mentor ${mentor ? 'found' : 'not found'} for userId: ${userId}`);
      return mentor;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching mentor by user ID ${userId}`, err);
      throw new RepositoryError('Error fetching mentor by user ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public updateMentorById = async (
    mentorId: string,
    updateData: Partial<IMentor>
  ): Promise<IMentor | null> => {
    try {
      logger.debug(`Updating mentor: ${mentorId}`);
      const updatedMentor = await this.findByIdAndUpdate(mentorId, updateData, { new: true });
      if (!updatedMentor) {
        logger.warn(`Mentor not found: ${mentorId}`);
        throw new RepositoryError(`Mentor not found with ID: ${mentorId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Mentor updated: ${mentorId}`);
      return updatedMentor;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating mentor ${mentorId}`, err);
      throw new RepositoryError('Error updating mentor', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

 
}
