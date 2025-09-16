import { injectable } from "inversify";
import { Types, Model } from "mongoose";
import { BaseRepository } from "../Core/Repositries/BaseRepositry";
import { RepositoryError } from "../Core/Utils/ErrorHandler";
import logger from "../Core/Utils/Logger";
import Collaboration from "../Models/collaboration";
import MentorRequest from "../Models/mentorRequset";
import Mentor from "../Models/mentor.model";
import { ICollaboration } from "../Interfaces/Models/ICollaboration";
import { IMentorRequest } from "../Interfaces/Models/IMentorRequest";
import { IMentor } from "../Interfaces/Models/IMentor";
import { IUser } from "../Interfaces/Models/IUser";
import { LockedSlot } from "../Utils/Types/Collaboration.types";
import { StatusCodes } from "../Constants/StatusCode.constants";
import { ICollaborationRepository } from "../Interfaces/Repository/ICollaborationRepository";

@injectable()
export class CollaborationRepository extends BaseRepository<ICollaboration> implements ICollaborationRepository{
  private _mentorRequestModel: Model<IMentorRequest>;

  constructor() {
    super(Collaboration as Model<ICollaboration>);
    this._mentorRequestModel = MentorRequest;
  }

  private toObjectId = (id?: string | Types.ObjectId | IMentor | IUser): Types.ObjectId => {
    if (!id) {
      logger.warn("Missing ID when converting to ObjectId");
      throw new RepositoryError("Invalid ID: ID is required", StatusCodes.BAD_REQUEST);
    }
    let idStr: string;
    if (typeof id === "string") {
      idStr = id;
    } else if (id instanceof Types.ObjectId) {
      idStr = id.toString();
    } else if (typeof id === "object" && "_id" in id) {
      idStr = (id as IUser | IMentor)._id.toString();
    } else {
      logger.warn(`Invalid ID type: ${typeof id}`);
      throw new RepositoryError(
        "Invalid ID: must be a string, ObjectId, IMentor, or IUser",
        StatusCodes.BAD_REQUEST
      );
    }
    if (!Types.ObjectId.isValid(idStr)) {
      logger.warn(`Invalid ObjectId format: ${idStr}`);
      throw new RepositoryError(
        "Invalid ID: must be a 24 character hex string",
        StatusCodes.BAD_REQUEST
      );
    }
    return new Types.ObjectId(idStr);
  }

  public createTemporaryRequest = async (data: Partial<IMentorRequest>): Promise<IMentorRequest> => {
    try {
      logger.debug(`Creating temporary request for user: ${data.userId}`);
      const request = await this._mentorRequestModel.create({
        ...data,
        mentorId: data.mentorId ? this.toObjectId(data.mentorId) : undefined,
        userId: data.userId ? this.toObjectId(data.userId) : undefined,
        paymentStatus: "Pending",
        isAccepted: "Pending",
      });
      logger.info(`Temporary request created: ${request._id}`);
      return request;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating temporary request`, err);
      throw new RepositoryError(
        "Error creating temporary request",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public getMentorRequestsByMentorId = async (mentorId: string): Promise<IMentorRequest[]> => {
    try {
      logger.debug(`Fetching mentor requests for mentor: ${mentorId}`);
      const requests = await this._mentorRequestModel
        .find({ mentorId: this.toObjectId(mentorId), isAccepted: "Pending" })
        .populate({
          path: "mentorId",
          populate: { path: "userId", select: "name email profilePic" },
        })
        .populate("userId", "name email profilePic")
        .lean()
        .exec();
      logger.info(`Fetched ${requests.length} mentor requests for mentorId: ${mentorId}`);
      return requests;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching mentor requests for mentorId ${mentorId}`, err);
      throw new RepositoryError(
        "Error fetching mentor requests",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public findMentorRequestById = async (id: string): Promise<IMentorRequest | null> => {
    try {
      logger.debug(`Finding mentor request by ID: ${id}`);
      const request = await this._mentorRequestModel.findById(this.toObjectId(id)).exec();
      logger.info(`Mentor request ${request ? "found" : "not found"}: ${id}`);
      return request;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error finding mentor request by ID ${id}`, err);
      throw new RepositoryError(
        "Error finding mentor request by ID",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }


  public updateMentorRequestStatus = async (
    id: string,
    status: string | "Pending" = "Pending"
  ): Promise<IMentorRequest | null> => {
    try {
      logger.debug(`Updating mentor request status for ID: ${id} to ${status}`);
      const request = await this._mentorRequestModel
        .findByIdAndUpdate(this.toObjectId(id), { isAccepted: status }, { new: true })
        .exec();
      logger.info(`Mentor request status updated: ${id} to ${status}`);
      return request;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating mentor request status for ID ${id}`, err);
      throw new RepositoryError(
        "Error updating mentor request status",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public getRequestByUserId = async (userId: string): Promise<IMentorRequest[]> => {
    try {
      logger.debug(`Fetching requests for user: ${userId}`);
      const requests = await this._mentorRequestModel
        .find({ userId: this.toObjectId(userId) })
        .populate({
          path: "mentorId",
          populate: { path: "userId", select: "name email profilePic" },
        })
        .exec();
      logger.info(`Fetched ${requests.length} mentor requests for userId: ${userId}`);
      return requests;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching requests for userId ${userId}`, err);
      throw new RepositoryError(
        "Error fetching requests by user ID",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public createCollaboration = async (collaborationData: Partial<ICollaboration>): Promise<ICollaboration> => {
    try {
      logger.debug(`Creating collaboration for user: ${collaborationData.userId}`);
      const collaboration = await this.create({
        ...collaborationData,
        mentorId: collaborationData.mentorId ? this.toObjectId(collaborationData.mentorId) : undefined,
        userId: collaborationData.userId ? this.toObjectId(collaborationData.userId) : undefined,
      });
      logger.info(`Collaboration created: ${collaboration._id}`);
      return collaboration;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating collaboration`, err);
      throw new RepositoryError(
        "Error creating collaboration",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public deleteMentorRequest = async (requestId: string): Promise<void> => {
    try {
      logger.debug(`Deleting mentor request: ${requestId}`);
      const result = await this._mentorRequestModel.findByIdAndDelete(this.toObjectId(requestId)).exec();
      if (!result) {
        logger.warn(`Mentor request not found for deletion: ${requestId}`);
        throw new RepositoryError(
          `Mentor request not found with ID: ${requestId}`,
          StatusCodes.NOT_FOUND
        );
      }
      logger.info(`Mentor request deleted: ${requestId}`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting mentor request ${requestId}`, err);
      throw new RepositoryError(
        "Error deleting mentor request",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public findCollabById = async (collabId: string): Promise<ICollaboration | null> => {
    try {
      logger.debug(`Finding collaboration by ID: ${collabId}`);
      const collab = await this.model
        .findById(this.toObjectId(collabId))
        .populate({
          path: "mentorId",
          model: "Mentor",
          populate: { path: "userId", model: "User" },
        })
        .populate({ path: "userId", model: "User" })
        .exec();
      logger.info(`Collaboration ${collab ? "found" : "not found"}: ${collabId}`);
      return collab;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error finding collaboration by ID ${collabId}`, err);
      throw new RepositoryError(
        "Error finding collaboration by ID",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public deleteCollabById = async (collabId: string): Promise<ICollaboration | null> => {
    try {
      logger.debug(`Deleting collaboration: ${collabId}`);
      const collab = await this.findByIdAndDelete(collabId);
      if (!collab) {
        logger.warn(`Collaboration not found for deletion: ${collabId}`);
        throw new RepositoryError(
          `Collaboration not found with ID: ${collabId}`,
          StatusCodes.NOT_FOUND
        );
      }
      logger.info(`Collaboration deleted: ${collabId}`);
      return collab;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting collaboration ${collabId}`, err);
      throw new RepositoryError(
        "Error deleting collaboration",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public markCollabAsCancelled = async (collabId: string): Promise<ICollaboration | null> => {
    try {
      logger.debug(`Marking collaboration as cancelled: ${collabId}`);
      const collab = await this.findByIdAndUpdate(
        collabId,
        { isCancelled: true },
        { new: true }
      );
      if (!collab) {
        logger.warn(`Collaboration not found for cancellation: ${collabId}`);
        throw new RepositoryError(
          `Collaboration not found with ID: ${collabId}`,
          StatusCodes.NOT_FOUND
        );
      }
      logger.info(`Collaboration marked as cancelled: ${collabId}`);
      return collab;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error marking collaboration as cancelled ${collabId}`, err);
      throw new RepositoryError(
        "Error marking collaboration as cancelled",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public updateCollabFeedback = async (collabId: string): Promise<ICollaboration | null> => {
    try {
      logger.debug(`Updating collaboration feedback for ID: ${collabId}`);
      const collab = await this.findByIdAndUpdate(
        collabId,
        { feedbackGiven: true },
        { new: true }
      );
      if (!collab) {
        logger.warn(`Collaboration not found for feedback update: ${collabId}`);
        throw new RepositoryError(
          `Collaboration not found with ID: ${collabId}`,
          StatusCodes.NOT_FOUND
        );
      }
      logger.info(`Collaboration feedback updated: ${collabId}`);
      return collab;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating collaboration feedback ${collabId}`, err);
      throw new RepositoryError(
        "Error updating collaboration feedback",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public getCollabDataForUser = async (userId: string): Promise<ICollaboration[]> => {
    try {
      logger.debug(`Fetching collaboration data for user: ${userId}`);
      const collaborations = await this.model
        .find({ userId: this.toObjectId(userId), isCancelled: false })
        .populate({
          path: "mentorId",
          populate: { path: "userId" },
        })
        .populate("userId")
        .exec();
      logger.info(`Fetched ${collaborations.length} collaborations for userId: ${userId}`);
      return collaborations;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching collaboration data for userId ${userId}`, err);
      throw new RepositoryError(
        "Error fetching collaboration data for user",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public getCollabDataForMentor = async (mentorId: string): Promise<ICollaboration[]> => {
    try {
      logger.debug(`Fetching collaboration data for mentor: ${mentorId}`);
      const mentor = await Mentor.findById(this.toObjectId(mentorId)).select("userId");
      if (!mentor) {
        logger.warn(`Mentor not found: ${mentorId}`);
        throw new RepositoryError("Mentor not found", StatusCodes.NOT_FOUND);
      }
      const userId = this.toObjectId(mentor.userId.toString());
      const collaborations = await this.model
        .find({
          $or: [
            { mentorId: this.toObjectId(mentorId), isCancelled: false, isCompleted: false },
            { userId, isCancelled: false, isCompleted: false },
          ],
        })
        .populate({
          path: "mentorId",
          populate: { path: "userId" },
        })
        .populate("userId")
        .exec();
      logger.info(`Fetched ${collaborations.length} collaborations for mentorId: ${mentorId}`);
      return collaborations;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching collaboration data for mentorId ${mentorId}`, err);
      throw new RepositoryError(
        "Error fetching collaboration data for mentor",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public findMentorRequest = async ({
    page = 1,
    limit = 10,
    search = "",
  }: {
    page: number;
    limit: number;
    search: string;
  }): Promise<{ requests: IMentorRequest[]; total: number; page: number; pages: number }> => {
    try {
      logger.debug(`Fetching mentor requests with page: ${page}, limit: ${limit}, search: ${search}`);
      const query: Record<string, any> = {};
      if (search) {
        query.$or = [
          { "userId.name": { $regex: search, $options: "i" } },
          { "userId.email": { $regex: search, $options: "i" } },
          { "mentorId.userId.name": { $regex: search, $options: "i" } },
          { "mentorId.userId.email": { $regex: search, $options: "i" } },
          { "mentorId.specialization": { $regex: search, $options: "i" } },
        ];
      }
      const total = await this._mentorRequestModel.countDocuments(query);
      const requests = await this._mentorRequestModel
        .find(query)
        .populate({
          path: "mentorId",
          model: "Mentor",
          populate: { path: "userId", model: "User" },
        })
        .populate({ path: "userId", model: "User" })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec();
      logger.info(`Fetched ${requests.length} mentor requests, total: ${total}`);
      return { requests, total, page, pages: Math.ceil(total / limit) || 1 };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching mentor requests`, err);
      throw new RepositoryError(
        "Error fetching mentor requests",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public findCollab = async ({
    page = 1,
    limit = 10,
    search = "",
  }: {
    page: number;
    limit: number;
    search: string;
  }): Promise<{ collabs: ICollaboration[]; total: number; page: number; pages: number }> => {
    try {
      logger.debug(`Fetching collaborations with page: ${page}, limit: ${limit}, search: ${search}`);
      const query: Record<string, any> = {};
      if (search) {
        query.$or = [
          { "userId.name": { $regex: search, $options: "i" } },
          { "userId.email": { $regex: search, $options: "i" } },
          { "mentorId.userId.name": { $regex: search, $options: "i" } },
          { "mentorId.userId.email": { $regex: search, $options: "i" } },
          { "mentorId.specialization": { $regex: search, $options: "i" } },
        ];
      }
      const total = await this.model.countDocuments(query);
      const collabs = await this.model
        .find(query)
        .populate({
          path: "mentorId",
          model: "Mentor",
          populate: { path: "userId", model: "User" },
        })
        .populate({ path: "userId", model: "User" })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec();
      logger.info(`Fetched ${collabs.length} collaborations, total: ${total}`);
      return { collabs, total, page, pages: Math.ceil(total / limit) || 1 };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching collaborations`, err);
      throw new RepositoryError(
        "Error fetching collaborations",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public fetchMentorRequestDetails = async (requestId: string): Promise<IMentorRequest | null> => {
    try {
      logger.debug(`Fetching mentor request details for ID: ${requestId}`);
      const result = await this._mentorRequestModel
        .findById(this.toObjectId(requestId))
        .populate({
          path: "mentorId",
          model: "Mentor",
          populate: { path: "userId", model: "User" },
        })
        .populate({ path: "userId", model: "User" })
        .exec();
      logger.info(`Mentor request details ${result ? "found" : "not found"}: ${requestId}`);
      return result;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching mentor request details ${requestId}`, err);
      throw new RepositoryError(
        "Error fetching mentor request details",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public findCollabDetails = async (collabId: string): Promise<ICollaboration | null> => {
    try {
      logger.debug(`Fetching collaboration details for ID: ${collabId}`);
      const collab = await this.findCollabById(collabId);
      logger.info(`Collaboration details ${collab ? "found" : "not found"}: ${collabId}`);
      return collab;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching collaboration details ${collabId}`, err);
      throw new RepositoryError(
        "Error fetching collaboration details",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public updateUnavailableDays = async (
    collabId: string,
    updateData: {
      datesAndReasons: { date: Date; reason: string }[];
      requestedBy: "user" | "mentor";
      requesterId: string;
      approvedById: string;
      isApproved: "pending" | "approved" | "rejected";
    }
  ): Promise<ICollaboration | null> => {
    try {
      logger.debug(`Updating unavailable days for collaboration: ${collabId}`);
      const collab = await this.findByIdAndUpdate(
        collabId,
        {
          $push: {
            unavailableDays: {
              datesAndReasons: updateData.datesAndReasons,
              requestedBy: updateData.requestedBy,
              requesterId: this.toObjectId(updateData.requesterId),
              approvedById: this.toObjectId(updateData.approvedById),
              isApproved: updateData.isApproved,
            },
          },
        },
        { new: true }
      );
      if (!collab) {
        logger.warn(`Collaboration not found for unavailable days update: ${collabId}`);
        throw new RepositoryError(
          `Collaboration not found with ID: ${collabId}`,
          StatusCodes.NOT_FOUND
        );
      }
      logger.info(`Unavailable days updated for collaboration: ${collabId}`);
      return collab;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating unavailable days for collaboration ${collabId}`, err);
      throw new RepositoryError(
        "Error updating unavailable days",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public updateTemporarySlotChanges = async (
    collabId: string,
    updateData: {
      datesAndNewSlots: { date: Date; newTimeSlots: string[] }[];
      requestedBy: "user" | "mentor";
      requesterId: string;
      approvedById: string;
      isApproved: "pending" | "approved" | "rejected";
    }
  ): Promise<ICollaboration | null> => {
    try {
      logger.debug(`Updating temporary slot changes for collaboration: ${collabId}`);
      const collab = await this.findByIdAndUpdate(
        collabId,
        {
          $push: {
            temporarySlotChanges: {
              datesAndNewSlots: updateData.datesAndNewSlots,
              requestedBy: updateData.requestedBy,
              requesterId: this.toObjectId(updateData.requesterId),
              approvedById: this.toObjectId(updateData.approvedById),
              isApproved: updateData.isApproved,
            },
          },
        },
        { new: true }
      );
      if (!collab) {
        logger.warn(`Collaboration not found for temporary slot changes update: ${collabId}`);
        throw new RepositoryError(
          `Collaboration not found with ID: ${collabId}`,
          StatusCodes.NOT_FOUND
        );
      }
      logger.info(`Temporary slot changes updated for collaboration: ${collabId}`);
      return collab;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating temporary slot changes for collaboration ${collabId}`, err);
      throw new RepositoryError(
        "Error updating temporary slot changes",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public updateRequestStatus = async (
    collabId: string,
    requestId: string,
    requestType: "unavailable" | "timeSlot",
    status: "approved" | "rejected",
    newEndDate?: Date
  ): Promise<ICollaboration | null> => {
    try {
      logger.debug(`Updating request status for collaboration: ${collabId}, request: ${requestId}`);
      const updateField = requestType === "unavailable" ? "unavailableDays" : "temporarySlotChanges";
      const updateQuery: Record<string, any> = {
        $set: {
          [`${updateField}.$.isApproved`]: status,
        },
      };
      if (newEndDate) {
        updateQuery.$set["endDate"] = newEndDate;
      }
      const collab = await this.model
        .findOneAndUpdate(
          {
            _id: this.toObjectId(collabId),
            [`${updateField}._id`]: this.toObjectId(requestId),
          },
          updateQuery,
          { new: true }
        )
        .populate({
          path: "mentorId",
          model: "Mentor",
          populate: { path: "userId", model: "User" },
        })
        .populate({ path: "userId", model: "User" })
        .exec();
      if (!collab) {
        logger.warn(`Collaboration not found for request status update: ${collabId}`);
        throw new RepositoryError(
          `Collaboration not found with ID: ${collabId}`,
          StatusCodes.NOT_FOUND
        );
      }
      logger.info(`Request status updated for collaboration: ${collabId}, request: ${requestId}`);
      return collab;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating request status for collaboration ${collabId}`, err);
      throw new RepositoryError(
        "Error updating request status",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public getLockedSlotsByMentorId = async (mentorId: string): Promise<LockedSlot[]> => {
    try {
      logger.debug(`Fetching locked slots for mentor: ${mentorId}`);
      const currentDate = new Date();
      const collaborations = await this.model
        .find({
          mentorId: this.toObjectId(mentorId),
          isCancelled: false,
          $or: [{ endDate: { $gt: currentDate } }, { endDate: null }],
        })
        .select("selectedSlot")
        .exec();
      const mentorRequests = await this._mentorRequestModel
        .find({
          mentorId: this.toObjectId(mentorId),
          isAccepted: "Accepted",
        })
        .select("selectedSlot")
        .exec();

      const collabSlots: LockedSlot[] = collaborations.flatMap((collab: any) =>
        collab.selectedSlot.map((slot: any) => ({
          day: slot.day,
          timeSlots: slot.timeSlots,
        }))
      );
      const requestSlots: LockedSlot[] = mentorRequests
        .map((request: any) => {
          const selectedSlot = request.selectedSlot as { day?: string; timeSlots?: string };
          if (!selectedSlot.day || !selectedSlot.timeSlots) {
            logger.warn(`Invalid selectedSlot for mentorRequestId: ${request._id}`);
            return null;
          }
          return {
            day: selectedSlot.day,
            timeSlots: [selectedSlot.timeSlots],
          };
        })
        .filter((slot): slot is LockedSlot => slot !== null);

      const allSlots: LockedSlot[] = [...collabSlots, ...requestSlots];
      const uniqueSlots: LockedSlot[] = [];
      allSlots.forEach((slot) => {
        const existing = uniqueSlots.find((s) => s.day === slot.day);
        if (existing) {
          existing.timeSlots = Array.from(new Set([...existing.timeSlots, ...slot.timeSlots]));
        } else {
          uniqueSlots.push({ day: slot.day, timeSlots: slot.timeSlots });
        }
      });

      logger.info(`Fetched ${uniqueSlots.length} locked slots for mentorId: ${mentorId}`);
      return uniqueSlots;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching locked slots for mentorId ${mentorId}`, err);
      throw new RepositoryError(
        "Error fetching locked slots",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public findByMentorId = async (mentorId: string): Promise<ICollaboration[]> => {
    try {
      logger.debug(`Fetching collaborations for mentor: ${mentorId}`);
      const collaborations = await this.model
        .find({ mentorId: this.toObjectId(mentorId), isCancelled: false })
        .populate("userId", "name email")
        .populate("mentorId", "userId")
        .exec();
      logger.info(`Fetched ${collaborations.length} collaborations for mentorId: ${mentorId}`);
      return collaborations;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching collaborations for mentorId ${mentorId}`, err);
      throw new RepositoryError(
        "Error fetching collaborations",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

public findByDateRange = async (startDate: Date, endDate: Date): Promise<ICollaboration[]> => {
    try {
      logger.debug(`Fetching collaborations from ${startDate} to ${endDate}`);
      const collaborations = await this.model
        .find({ createdAt: { $gte: startDate, $lte: endDate }, isCancelled: false })
        .populate("userId")
        .populate("mentorId")
        .exec();
      logger.info(`Fetched ${collaborations.length} collaborations for date range`);
      return collaborations;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching collaborations by date range`, err);
      throw new RepositoryError(
        "Error fetching collaborations",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }
}
