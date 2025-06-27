import { Types, Model } from "mongoose";
import { BaseRepository } from "../../../core/Repositries/BaseRepositry";
import { RepositoryError } from "../../../core/Utils/ErrorHandler";
import logger from "../../../core/Utils/Logger";
import Collaboration from "../../../models/collaboration";
import MentorRequest from "../../../models/mentorRequset";
import Mentor from "../../../models/mentor.model";
import { ICollaboration } from "../../../Interfaces/models/ICollaboration";
import { IMentorRequest } from "../../../Interfaces/models/IMentorRequest";
import { IMentor } from "../../../Interfaces/models/IMentor";
import { UserInterface } from "../../../Interfaces/models/IUser";
import { LockedSlot } from "../Types/types";

export class CollaborationRepository extends BaseRepository<ICollaboration> {
  private mentorRequestModel: Model<IMentorRequest>;

  constructor() {
    super(Collaboration as Model<ICollaboration>);
    this.mentorRequestModel = MentorRequest;
  }

  private toObjectId(
    id?: string | Types.ObjectId | IMentor | UserInterface
  ): Types.ObjectId {
    if (!id) {
      logger.error("Missing ID");
      throw new RepositoryError("Invalid ID: ID is required");
    }
    let idStr: string;
    if (typeof id === "string") {
      idStr = id;
    } else if (id instanceof Types.ObjectId) {
      idStr = id.toString();
    } else if (typeof id === "object" && "_id" in id) {
      idStr = (id as UserInterface | IMentor)._id.toString();
    } else {
      logger.error(`Invalid ID type: ${typeof id}`);
      throw new RepositoryError(
        "Invalid ID: must be a string, ObjectId, IMentor, or UserInterface"
      );
    }
    if (!Types.ObjectId.isValid(idStr)) {
      logger.error(`Invalid ID: ${idStr}`);
      throw new RepositoryError(
        "Invalid ID: must be a 24 character hex string"
      );
    }
    return new Types.ObjectId(idStr);
  }

  createTemporaryRequest = async (
    data: Partial<IMentorRequest>
  ): Promise<IMentorRequest> => {
    try {
      logger.debug(`Creating temporary request for user: ${data.userId}`);
      return await this.mentorRequestModel.create({
        ...data,
        mentorId: data.mentorId ? this.toObjectId(data.mentorId) : undefined,
        userId: data.userId ? this.toObjectId(data.userId) : undefined,
        paymentStatus: "Pending",
        isAccepted: "Pending",
      });
    } catch (error: any) {
      logger.error(`Error creating temporary request: ${error.message}`);
      throw new RepositoryError(
        `Error creating temporary request: ${error.message}`
      );
    }
  };

  getMentorRequestsByMentorId = async (
    mentorId: string
  ): Promise<IMentorRequest[]> => {
    try {
      logger.debug(`Fetching mentor requests for mentor: ${mentorId}`);
      return await this.mentorRequestModel
        .find({ mentorId: this.toObjectId(mentorId) })
        .populate("userId", "name profilePic")
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching mentor requests: ${error.message}`);
      throw new RepositoryError(
        `Error fetching mentor requests: ${error.message}`
      );
    }
  };

  findMentorRequestById = async (
    id: string
  ): Promise<IMentorRequest | null> => {
    try {
      logger.debug(`Finding mentor request by ID: ${id}`);
      return await this.mentorRequestModel.findById(this.toObjectId(id)).exec();
    } catch (error: any) {
      logger.error(`Error finding mentor request by ID: ${error.message}`);
      throw new RepositoryError(
        `Error finding mentor request by ID: ${error.message}`
      );
    }
  };

  updateMentorRequestStatus = async (
    id: string,
    status: string
  ): Promise<IMentorRequest | null> => {
    try {
      logger.debug(`Updating mentor request status for ID: ${id} to ${status}`);
      return await this.mentorRequestModel
        .findByIdAndUpdate(
          this.toObjectId(id),
          { isAccepted: status },
          { new: true }
        )
        .exec();
    } catch (error: any) {
      logger.error(`Error updating mentor request status: ${error.message}`);
      throw new RepositoryError(
        `Error updating mentor request status: ${error.message}`
      );
    }
  };

  getRequestByUserId = async (userId: string): Promise<IMentorRequest[]> => {
    try {
      logger.debug(`Fetching requests for user: ${userId}`);
      return await this.mentorRequestModel
        .find({ userId: this.toObjectId(userId) })
        .populate({
          path: "mentorId",
          populate: {
            path: "userId",
            select: "name email profilePic",
          },
        })
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching requests by user ID: ${error.message}`);
      throw new RepositoryError(
        `Error fetching requests by user ID: ${error.message}`
      );
    }
  };

  createCollaboration = async (
    collaborationData: Partial<ICollaboration>
  ): Promise<ICollaboration> => {
    try {
      logger.debug(
        `Creating collaboration for user: ${collaborationData.userId}`
      );
      return await this.create({
        ...collaborationData,
        mentorId: collaborationData.mentorId
          ? this.toObjectId(collaborationData.mentorId)
          : undefined,
        userId: collaborationData.userId
          ? this.toObjectId(collaborationData.userId)
          : undefined,
      });
    } catch (error: any) {
      logger.error(`Error creating collaboration: ${error.message}`);
      throw new RepositoryError(
        `Error creating collaboration: ${error.message}`
      );
    }
  };

  deleteMentorRequest = async (requestId: string): Promise<void> => {
    try {
      logger.debug(`Deleting mentor request: ${requestId}`);
      await this.mentorRequestModel
        .findByIdAndDelete(this.toObjectId(requestId))
        .exec();
    } catch (error: any) {
      logger.error(`Error deleting mentor request: ${error.message}`);
      throw new RepositoryError(
        `Error deleting mentor request: ${error.message}`
      );
    }
  };

  findCollabById = async (collabId: string): Promise<ICollaboration | null> => {
    try {
      logger.debug(`Finding collaboration by ID: ${collabId}`);
      return await this.model
        .findById(this.toObjectId(collabId))
        .populate({
          path: "mentorId",
          model: "Mentor",
          populate: {
            path: "userId",
            model: "User",
          },
        })
        .populate({
          path: "userId",
          model: "User",
        })
        .exec();
    } catch (error: any) {
      logger.error(`Error finding collaboration: ${error.message}`);
      throw new RepositoryError(
        `Error finding collaboration: ${error.message}`
      );
    }
  };

  deleteCollabById = async (
    collabId: string
  ): Promise<ICollaboration | null> => {
    try {
      logger.debug(`Deleting collaboration: ${collabId}`);
      return await this.findByIdAndDelete(this.toObjectId(collabId).toString());
    } catch (error: any) {
      logger.error(`Error deleting collaboration: ${error.message}`);
      throw new RepositoryError(
        `Error deleting collaboration: ${error.message}`
      );
    }
  };

  markCollabAsCancelled = async (
    collabId: string
  ): Promise<ICollaboration | null> => {
    try {
      logger.debug(`Marking collaboration as cancelled: ${collabId}`);
      return await this.findByIdAndUpdate(
        this.toObjectId(collabId).toString(),
        { isCancelled: true },
        { new: true }
      );
    } catch (error: any) {
      logger.error(
        `Error marking collaboration as cancelled: ${error.message}`
      );
      throw new RepositoryError(
        `Error marking collaboration as cancelled: ${error.message}`
      );
    }
  };

  updateCollabFeedback = async (
    collabId: string
  ): Promise<ICollaboration | null> => {
    try {
      logger.debug(`Updating collaboration feedback for ID: ${collabId}`);
      return await this.findByIdAndUpdate(
        this.toObjectId(collabId).toString(),
        { feedbackGiven: true },
        { new: true }
      );
    } catch (error: any) {
      logger.error(`Error updating collaboration feedback: ${error.message}`);
      throw new RepositoryError(
        `Error updating collaboration feedback: ${error.message}`
      );
    }
  };

  getCollabDataForUser = async (userId: string): Promise<ICollaboration[]> => {
    try {
      logger.debug(`Fetching collaboration data for user: ${userId}`);
      return await this.model
        .find({ userId: this.toObjectId(userId), isCancelled: false })
        .populate({
          path: "mentorId",
          populate: {
            path: "userId",
          },
        })
        .populate("userId")
        .exec();
    } catch (error: any) {
      logger.error(
        `Error fetching collaboration data for user: ${error.message}`
      );
      throw new RepositoryError(
        `Error fetching collaboration data for user: ${error.message}`
      );
    }
  };

  getCollabDataForMentor = async (
    mentorId: string
  ): Promise<ICollaboration[]> => {
    try {
      logger.debug(`Fetching collaboration data for mentor: ${mentorId}`);
      const mentor = await Mentor.findById(this.toObjectId(mentorId)).select(
        "userId"
      );
      if (!mentor) {
        throw new RepositoryError("Mentor not found");
      }
      const userId = this.toObjectId(mentor.userId.toString());
      return await this.model
        .find({
          $or: [
            { mentorId: this.toObjectId(mentorId), isCancelled: false },
            { userId, isCancelled: false },
          ],
        })
        .populate({
          path: "mentorId",
          populate: {
            path: "userId",
          },
        })
        .populate("userId")
        .exec();
    } catch (error: any) {
      logger.error(
        `Error fetching collaboration data for mentor: ${error.message}`
      );
      throw new RepositoryError(
        `Error fetching collaboration data for mentor: ${error.message}`
      );
    }
  };

  findMentorRequest = async ({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search: string;
  }) => {
    try {
      logger.debug(
        `Fetching mentor requests with page: ${page}, limit: ${limit}, search: ${search}`
      );

      const query: any = {};
      if (search) {
        query.$or = [
          { "userId.name": { $regex: search, $options: "i" } },
          { "userId.email": { $regex: search, $options: "i" } },
          { "mentorId.userId.name": { $regex: search, $options: "i" } },
          { "mentorId.userId.email": { $regex: search, $options: "i" } },
          { "mentorId.specialization": { $regex: search, $options: "i" } },
        ];
      }

      // const trimmedSearch = (search || "").trim();
      // logger.debug(`Trimmed search term: "${trimmedSearch}"`);

      // const query = trimmedSearch
      //   ? {
      //       $or: [
      //         { "userId.name": { $regex: trimmedSearch, $options: "i" } },
      //         { "userId.email": { $regex: trimmedSearch, $options: "i" } },
      //         {
      //           "mentorId.userId.name": {
      //             $regex: trimmedSearch,
      //             $options: "i",
      //           },
      //         },
      //         {
      //           "mentorId.userId.email": {
      //             $regex: trimmedSearch,
      //             $options: "i",
      //           },
      //         },
      //         {
      //           "mentorId.specialization": {
      //             $regex: trimmedSearch,
      //             $options: "i",
      //           },
      //         },
      //       ],
      //     }
      //   : {};

      logger.debug("Search query:", query);

      const total = await this.mentorRequestModel.countDocuments(query);
      logger.debug(`Total mentor requests found: ${total}`);

      const requests = await this.mentorRequestModel
        .find(query)
        .populate({
          path: "mentorId",
          model: "Mentor",
          populate: {
            path: "userId",
            model: "User",
          },
        })
        .populate({
          path: "userId",
          model: "User",
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec();

      logger.debug(
        "Fetched mentor requests:",
        JSON.stringify(requests, null, 2)
      );

      return { requests, total, page, pages: Math.ceil(total / limit) || 1 };
    } catch (error: any) {
      logger.error(`Error fetching mentor requests: ${error.message}`);
      throw new RepositoryError(
        `Error fetching mentor requests: ${error.message}`
      );
    }
  };

  findCollab = async ({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search: string;
  }) => {
    try {
      logger.debug(
        `Fetching collaborations with page: ${page}, limit: ${limit}, search: ${search}`
      );

      //  const trimmedSearch = (search || '').trim();
      //  logger.debug(`Trimmed search term: "${trimmedSearch}"`);
      const query: any = {};

      if (search) {
        query.$or = [
          { "userId.name": { $regex: search, $options: "i" } },
          { "userId.email": { $regex: search, $options: "i" } },
          { "mentorId.userId.name": { $regex: search, $options: "i" } },
          { "mentorId.userId.email": { $regex: search, $options: "i" } },
          { "mentorId.specialization": { $regex: search, $options: "i" } },
        ];
      }

      // const query = trimmedSearch
      //   ? {
      //       $or: [
      //         { 'userId.name': { $regex: trimmedSearch, $options: 'i' } },
      //         { 'userId.email': { $regex: trimmedSearch, $options: 'i' } },
      //         { 'mentorId.userId.name': { $regex: trimmedSearch, $options: 'i' } },
      //         { 'mentorId.userId.email': { $regex: trimmedSearch, $options: 'i' } },
      //         { 'mentorId.specialization': { $regex: trimmedSearch, $options: 'i' } },
      //       ],
      //     }
      //   : {};

      logger.debug("Search query:", JSON.stringify(query, null, 2));

      // Get total count
      const total = await this.model.countDocuments(query);
      logger.debug(`Total collaborations found: ${total}`);

      const collabs = await this.model
        .find(query)
        .populate({
          path: "mentorId",
          model: "Mentor",
          populate: {
            path: "userId",
            model: "User",
          },
        })
        .populate({
          path: "userId",
          model: "User",
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec();

      logger.debug("Fetched collaborations:", JSON.stringify(collabs, null, 2));

      return { collabs, total, page, pages: Math.ceil(total / limit) || 1 };
    } catch (error: any) {
      logger.error(`Error fetching collaborations: ${error.message}`);
      throw new RepositoryError(
        `Error fetching collaborations: ${error.message}`
      );
    }
  };

  fetchMentorRequestDetails = async (
    requestId: string
  ): Promise<IMentorRequest | null> => {
    try {
      logger.debug(`Fetching mentor request details for ID: ${requestId}`);
      return await this.mentorRequestModel
        .findById(this.toObjectId(requestId))
        .populate({
          path: "mentorId",
          model: "Mentor",
          populate: {
            path: "userId",
            model: "User",
          },
        })
        .populate({
          path: "userId",
          model: "User",
        })
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching mentor request details: ${error.message}`);
      throw new RepositoryError(
        `Error fetching mentor request details: ${error.message}`
      );
    }
  };

  findCollabDetails = async (
    collabId: string
  ): Promise<ICollaboration | null> => {
    try {
      logger.debug(`Fetching collaboration details for ID: ${collabId}`);
      return await this.findCollabById(collabId);
    } catch (error: any) {
      logger.error(`Error fetching collaboration details: ${error.message}`);
      throw new RepositoryError(
        `Error fetching collaboration details: ${error.message}`
      );
    }
  };

  updateUnavailableDays = async (
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
      return await this.findByIdAndUpdate(
        this.toObjectId(collabId).toString(),
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
    } catch (error: any) {
      logger.error(`Error updating unavailable days: ${error.message}`);
      throw new RepositoryError(
        `Error updating unavailable days: ${error.message}`
      );
    }
  };

  updateTemporarySlotChanges = async (
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
      logger.debug(
        `Updating temporary slot changes for collaboration: ${collabId}`
      );
      return await this.findByIdAndUpdate(
        this.toObjectId(collabId).toString(),
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
    } catch (error: any) {
      logger.error(`Error updating temporary slot changes: ${error.message}`);
      throw new RepositoryError(
        `Error updating temporary slot changes: ${error.message}`
      );
    }
  };

  updateRequestStatus = async (
    collabId: string,
    requestId: string,
    requestType: "unavailable" | "timeSlot",
    status: "approved" | "rejected",
    newEndDate?: Date
  ): Promise<ICollaboration | null> => {
    try {
      logger.debug(
        `Updating request status for collaboration: ${collabId}, request: ${requestId}`
      );
      const updateField =
        requestType === "unavailable"
          ? "unavailableDays"
          : "temporarySlotChanges";
      let updateQuery: any = {
        $set: {
          [`${updateField}.$.isApproved`]: status,
        },
      };
      if (newEndDate) {
        updateQuery.$set["endDate"] = newEndDate;
      }
      return await this.model
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
          populate: {
            path: "userId",
            model: "User",
          },
        })
        .populate({
          path: "userId",
          model: "User",
        })
        .exec();
    } catch (error: any) {
      logger.error(`Error updating request status: ${error.message}`);
      throw new RepositoryError(
        `Error updating request status: ${error.message}`
      );
    }
  };

  getLockedSlotsByMentorId = async (
    mentorId: string
  ): Promise<LockedSlot[]> => {
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
      const mentorRequests = await this.mentorRequestModel
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
          const selectedSlot = request.selectedSlot as {
            day?: string;
            timeSlots?: string;
          };
          if (!selectedSlot.day || !selectedSlot.timeSlots) {
            logger.warn(
              `Invalid selectedSlot for mentorRequestId: ${request._id}`
            );
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
          existing.timeSlots = Array.from(
            new Set([...existing.timeSlots, ...slot.timeSlots])
          );
        } else {
          uniqueSlots.push({ day: slot.day, timeSlots: slot.timeSlots });
        }
      });

      logger.info(
        `Fetched ${uniqueSlots.length} locked slots for mentorId: ${mentorId}`
      );
      return uniqueSlots;
    } catch (error: any) {
      logger.error(`Error fetching locked slots: ${error.message}`);
      throw new RepositoryError(
        `Error fetching locked slots: ${error.message}`
      );
    }
  };
}
