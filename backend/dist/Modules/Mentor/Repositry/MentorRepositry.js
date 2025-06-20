import { Types } from "mongoose";
import { BaseRepository } from "../../../core/Repositries/BaseRepositry.js";
import { RepositoryError } from "../../../core/Utils/ErrorHandler.js";
import logger from "../../../core/Utils/Logger.js";
import Mentor from "../../../models/mentor.model.js";
export class MentorRepository extends BaseRepository {
    constructor() {
        super(Mentor);
    }
    toObjectId(id) {
        if (!id) {
            logger.error('Missing ID');
            throw new RepositoryError('Invalid ID: ID is required');
        }
        let idStr;
        if (typeof id === 'string') {
            idStr = id;
        }
        else if (id instanceof Types.ObjectId) {
            idStr = id.toString();
        }
        else if (typeof id === 'object' && '_id' in id) {
            idStr = id._id.toString();
        }
        else {
            logger.error(`Invalid ID type: ${typeof id}`);
            throw new RepositoryError('Invalid ID: must be a string, ObjectId, or UserInterface');
        }
        if (!Types.ObjectId.isValid(idStr)) {
            logger.error(`Invalid ID: ${idStr}`);
            throw new RepositoryError('Invalid ID: must be a 24 character hex string');
        }
        return new Types.ObjectId(idStr);
    }
    submitMentorRequest = async (data) => {
        try {
            logger.debug(`Submitting mentor request for user: ${data.userId}`);
            return await this.create({
                ...data,
                userId: this.toObjectId(data.userId),
            });
        }
        catch (error) {
            logger.error(`Error submitting mentor request: ${error.message}`);
            throw new RepositoryError(`Error submitting mentor request: ${error.message}`);
        }
    };
    getAllMentorRequests = async (page = 1, limit = 10, search = "", status = "", sort = "desc") => {
        try {
            logger.debug(`Fetching mentor requests with page: ${page}, limit: ${limit}, search: ${search}`);
            const query = {};
            if (status)
                query.isApproved = status;
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
        }
        catch (error) {
            logger.error(`Error fetching mentor requests: ${error.message}`);
            throw new RepositoryError(`Error fetching mentor requests: ${error.message}`);
        }
    };
    getAllMentors = async () => {
        try {
            logger.debug(`Fetching all approved mentors`);
            return await this.model
                .find({ isApproved: "Completed" })
                .populate("userId")
                .populate("skills")
                .exec();
        }
        catch (error) {
            logger.error(`Error fetching mentors: ${error.message}`);
            throw new RepositoryError(`Error fetching mentors: ${error.message}`);
        }
    };
    getMentorDetails = async (id) => {
        try {
            logger.debug(`Fetching mentor details for ID: ${id}`);
            return await this.model
                .findById(this.toObjectId(id))
                .populate("userId")
                .populate("skills")
                .exec();
        }
        catch (error) {
            logger.error(`Error fetching mentor details: ${error.message}`);
            throw new RepositoryError(`Error fetching mentor details: ${error.message}`);
        }
    };
    approveMentorRequest = async (id) => {
        try {
            logger.debug(`Approving mentor request: ${id}`);
            return await this.model
                .findByIdAndUpdate(this.toObjectId(id), { isApproved: "Completed" }, { new: true })
                .lean();
        }
        catch (error) {
            logger.error(`Error approving mentor request: ${error.message}`);
            throw new RepositoryError(`Error approving mentor request: ${error.message}`);
        }
    };
    rejectMentorRequest = async (id) => {
        try {
            logger.debug(`Rejecting mentor request: ${id}`);
            return await this.model
                .findByIdAndUpdate(this.toObjectId(id), { isApproved: "Rejected" }, { new: true })
                .lean();
        }
        catch (error) {
            logger.error(`Error rejecting mentor request: ${error.message}`);
            throw new RepositoryError(`Error rejecting mentor request: ${error.message}`);
        }
    };
    cancelMentorship = async (id) => {
        try {
            logger.debug(`Cancelling mentorship: ${id}`);
            return await this.model
                .findByIdAndUpdate(this.toObjectId(id), { isApproved: "Processing" }, { new: true })
                .lean();
        }
        catch (error) {
            logger.error(`Error cancelling mentorship: ${error.message}`);
            throw new RepositoryError(`Error cancelling mentorship: ${error.message}`);
        }
    };
    getMentorById = async (id) => {
        try {
            logger.debug(`Fetching mentor by ID: ${id}`);
            return await this.model
                .findById(this.toObjectId(id))
                .populate("userId", "name email")
                .populate("skills", "name")
                .exec();
        }
        catch (error) {
            logger.error(`Error fetching mentor by ID: ${error.message}`);
            throw new RepositoryError(`Error fetching mentor by ID: ${error.message}`);
        }
    };
    getMentorByUserId = async (userId) => {
        try {
            logger.debug(`Fetching mentor by user ID: ${userId}`);
            return await this.model
                .findOne({ userId: this.toObjectId(userId) })
                .populate("userId")
                .populate("skills")
                .exec();
        }
        catch (error) {
            logger.error(`Error fetching mentor by user ID: ${error.message}`);
            throw new RepositoryError(`Error fetching mentor by user ID: ${error.message}`);
        }
    };
    updateMentorById = async (mentorId, updateData) => {
        try {
            logger.debug(`Updating mentor: ${mentorId}`);
            return await this.findByIdAndUpdate(mentorId, updateData, { new: true });
        }
        catch (error) {
            logger.error(`Error updating mentor: ${error.message}`);
            throw new RepositoryError(`Error updating mentor: ${error.message}`);
        }
    };
    saveMentorRequest = async (data) => {
        try {
            logger.debug(`Saving mentor request for user: ${data.userId}`);
            return await this.create({
                ...data,
                userId: data.userId ? this.toObjectId(data.userId) : undefined,
            });
        }
        catch (error) {
            logger.error(`Error saving mentor request: ${error.message}`);
            throw new RepositoryError(`Error saving mentor request: ${error.message}`);
        }
    };
}
//# sourceMappingURL=MentorRepositry.js.map