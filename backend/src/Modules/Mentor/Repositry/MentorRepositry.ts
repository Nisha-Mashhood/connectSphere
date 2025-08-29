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

getAllMentors = async (
  query: MentorQuery = {}
): Promise<{ mentors: IMentor[]; total: number }> => {
  try {
    logger.debug(
      `Fetching all approved mentors with query: ${JSON.stringify(query)}`
    );

    const {
      search,
      page = 1,
      limit = 10,
      skill,
      category,
      sortBy = "name",
      sortOrder = "asc",
    } = query;


    // Log category and skill details
      logger.info(`Selected category: ${category || 'None'}, Skill: ${skill || 'None'}`);

      // Fetch all approved mentors before filtering for debugging
      const allMentors = await this.model
        .find({ isApproved: 'Completed' })
        .populate('userId', 'name email profilePic')
        .populate('skills', 'name subcategoryId')
        .lean()
        .exec();
      logger.debug(`All approved mentors before filtering: ${JSON.stringify(
        allMentors, null, 2)}`);

      // Build match stage for initial filtering
      const matchStage: any = { isApproved: 'Completed' };
      if (search) {
        matchStage['userId.name'] = { $regex: search, $options: 'i' };
      }

      // Build aggregation pipeline
      const pipeline: any[] = [
        // Lookup for user details, including profilePic
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
            pipeline: [
              { $project: { name: 1, email: 1, profilePic: 1 } }
            ]
          },
        },
        { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
        // Lookup for skills
        {
          $lookup: {
            from: 'skills',
            localField: 'skills',
            foreignField: '_id',
            as: 'skills',
            pipeline: [
              { $project: { name: 1, subcategoryId: 1 } }
            ]
          },
        },
        // Lookup for feedback to calculate average rating
        {
          $lookup: {
            from: 'feedbacks',
            localField: '_id',
            foreignField: 'mentorId',
            as: 'feedbacks',
          },
        },
        // Add average rating and feedback count
        {
          $addFields: {
            avgRating: { $avg: '$feedbacks.rating' },
            feedbackCount: { $size: '$feedbacks' },
          },
        },
      ];

      // skill and category filtering
      if (skill || category) {
        // Lookup for subcategories
        pipeline.push({
          $lookup: {
            from: 'subcategories',
            localField: 'skills.subcategoryId',
            foreignField: '_id',
            as: 'subcategories',
          },
        });
        // Lookup for categories
        pipeline.push({
          $lookup: {
            from: 'categories',
            localField: 'subcategories.categoryId',
            foreignField: '_id',
            as: 'categories',
          },
        });

        // Apply skill and category filters
        const filterStage: any = {};
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

      // Apply base filters (price, approval, search)
      pipeline.push({ $match: matchStage });

      // Log mentors after filtering but before sorting/pagination
      pipeline.push({
        $project: {
          _id: 1,
          'userId.name': 1,
          'userId.email': 1,
          'userId.profilePic': 1,
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
      // const tempPipeline = [...pipeline, { $skip: 0 }, { $limit: 100 }];
      // const intermediateResult = await this.model.aggregate(tempPipeline).exec();

      // Sorting
      const sortStage: any = {};
      if (sortBy === 'rating') {
        sortStage.avgRating = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'price') {
        sortStage.price = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'feedbackCount') {
        sortStage.feedbackCount = sortOrder === 'asc' ? 1 : -1;
      } else {
        sortStage['userId.name'] = sortOrder === 'asc' ? 1 : -1;
      }
      pipeline.push({ $sort: sortStage });

      // Pagination
      pipeline.push({
        $facet: {
          mentors: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          total: [{ $count: 'count' }],
        },
      });

      logger.debug(`Executing mentor aggregation pipeline: ${JSON.stringify(pipeline, null, 2)}`);
      const result = await this.model.aggregate(pipeline).exec();
      const mentors = result[0]?.mentors || [];
      const total = result[0]?.total[0]?.count || 0;

      logger.info(`Final result - Fetched ${mentors.length} mentors, total: ${total}`)

      return { mentors, total };
    } catch (error: any) {
      logger.error(`Error fetching mentors: ${error.message}`);
      throw new RepositoryError(`Error fetching mentors: ${error.message}`);
    }
};


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
