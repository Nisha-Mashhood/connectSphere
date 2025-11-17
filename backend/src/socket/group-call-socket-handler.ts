import { Server, Socket } from "socket.io";
import logger from "../core/utils/logger";
import {
  createCallLog,
  updateCallLog,
} from "./Utils/call-log-helper";
import { inject, injectable } from "inversify";
import { IGroupRepository } from "../Interfaces/Repository/i-group-repositry";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { INotificationService } from "../Interfaces/Services/i-notification-service";
import { ICallLogRepository } from "../Interfaces/Repository/i-call-repositry";

interface GroupCallData {
  groupId: string;
  senderId: string;
  recipientId: string;
  callType: "audio" | "video";
  callId: string;
}

interface GroupOfferData extends GroupCallData {
  offer: RTCSessionDescriptionInit;
}

interface GroupAnswerData extends GroupCallData {
  answer: RTCSessionDescriptionInit;
}

interface GroupIceCandidateData extends GroupCallData {
  candidate: RTCIceCandidateInit;
}

interface GroupJoinCallData {
  groupId: string;
  userId: string;
  callType: "audio" | "video";
  callId: string;
}

interface GroupCallOffer {
  senderId: string;
  recipientIds: string[];
  callType: "audio" | "video";
  callId: string;
  endTimeout: NodeJS.Timeout;
}

@injectable()
export class GroupCallSocketHandler {
  private _activeOffers: Map<string, GroupCallOffer> = new Map();
  private _endedCalls: Set<string> = new Set();
  private _joinedUsersByCallId: Map<string, Set<string>> = new Map();
  private _groupRepo: IGroupRepository;
  private _userRepo: IUserRepository;
  private _notificationService: INotificationService;
  private _callLogRepo: ICallLogRepository;
  private _io: Server | null = null;
  private _groupToCallId: Map<string, string> = new Map();

  constructor(
    @inject("IGroupRepository") groupRepo: IGroupRepository,
    @inject("IUserRepository") userRepo: IUserRepository,
    @inject("INotificationService") notificationService: INotificationService,
    @inject("ICallLogRepository") callLogRepo: ICallLogRepository
  ) {
    this._groupRepo = groupRepo;
    this._userRepo = userRepo;
    this._notificationService = notificationService;
    this._callLogRepo = callLogRepo;
  }

  public setIo(io: Server): void {
    this._io = io;
  }

  public getCallIdForGroup(groupId: string): string | undefined {
    return this._groupToCallId.get(groupId);
  }

  public async handleGroupOffer(
    socket: Socket,
    data: GroupOfferData
  ): Promise<void> {
    try {
      const { groupId, senderId, recipientId, offer, callType, callId } = data;
      logger.info(
        `Received group ${callType} offer from ${senderId} to ${recipientId} for callId: ${callId}, groupId: ${groupId}`
      );

      const group = await this._groupRepo.getGroupById(groupId);
      if (!group) {
        logger.error(`Invalid group ID: ${groupId}`);
        socket.emit("error", { message: "Invalid group ID" });
        return;
      }

      const recipientIds = group.members
        .filter((member) => member.userId._id.toString() !== senderId)
        .map((member) => member.userId._id.toString());

      if (!recipientIds.includes(recipientId)) {
        logger.error(
          `Recipient ${recipientId} is not a member of group ${groupId}`
        );
        socket.emit("error", { message: "Invalid recipient for group call" });
        return;
      }

      const recipientSocketRoom = `user_${recipientId}`;
      const socketsInRoom = await this._io?.in(recipientSocketRoom).allSockets();
      if (!socketsInRoom || socketsInRoom.size === 0) {
        logger.warn(
          `No sockets found in room ${recipientSocketRoom} for recipient ${recipientId}`
        );
        return;
      }

      const sender = await this._userRepo.findById(senderId);
      logger.info(
        `Emitting groupOffer to ${recipientSocketRoom} for recipient ${recipientId}`
      );
      this._io?.to(recipientSocketRoom).emit("groupOffer", {
        groupId,
        senderId,
        recipientId,
        offer,
        callType,
        callId,
        senderName: sender?.name,
      });
    } catch (error: any) {
      logger.error(`Error broadcasting group offer: ${error.message}`);
      socket.emit("error", { message: "Failed to send group offer" });
    }
  }

  public async handleGroupAnswer(
    socket: Socket,
    data: GroupAnswerData
  ): Promise<void> {
    try {
      const { groupId, senderId, recipientId, answer, callType, callId } = data;
      logger.info(
        `Received group ${callType} answer from ${senderId} to ${recipientId} for callId: ${callId}, groupId: ${groupId}`
      );

      const group = await this._groupRepo.getGroupById(groupId);
      if (!group) {
        logger.error(`Invalid group ID: ${groupId}`);
        socket.emit("error", { message: "Invalid group ID" });
        return;
      }

      const recipientSocketRoom = `user_${recipientId}`;
      const socketsInRoom = await this._io?.in(recipientSocketRoom).allSockets();
      if (!socketsInRoom || socketsInRoom.size === 0) {
        logger.warn(
          `No sockets found in room ${recipientSocketRoom} for recipient ${recipientId}`
        );
        return;
      }

      logger.info(
        `Emitting groupAnswer to ${recipientSocketRoom} for recipient ${recipientId}`
      );
      this._io?.to(recipientSocketRoom).emit("groupAnswer", {
        groupId,
        senderId,
        recipientId,
        answer,
        callType,
        callId,
      });

      const call = this._activeOffers.get(callId);
      if (call) {
        clearTimeout(call.endTimeout);
        this._activeOffers.delete(callId);
        logger.info(`Cleared active offer for callId: ${callId}`);
      }
    } catch (error: any) {
      logger.error(`Error broadcasting group answer: ${error.message}`);
      socket.emit("error", { message: "Failed to send group answer" });
    }
  }

  public async handleGroupIceCandidate(
    socket: Socket,
    data: GroupIceCandidateData
  ): Promise<void> {
    try {
      const { groupId, senderId, recipientId, candidate, callType, callId } =
        data;
      logger.info(
        `Received group ${callType} ICE candidate from ${senderId} for callId: ${callId}, groupId: ${groupId}`
      );

      const group = await this._groupRepo.getGroupById(groupId);
      if (!group) {
        logger.error(`Invalid group ID: ${groupId}`);
        socket.emit("error", { message: "Invalid group ID" });
        return;
      }

      this._io?.to(`user_${recipientId}`).emit("groupIceCandidate", {
        groupId,
        senderId,
        recipientId,
        candidate,
        callType,
        callId,
      });
    } catch (error: any) {
      logger.error(`Error broadcasting group ICE candidate: ${error.message}`);
      socket.emit("error", { message: "Failed to send group ICE candidate" });
    }
  }

  public async handleGroupCallEnded(
    socket: Socket,
    data: GroupCallData
  ): Promise<void> {
    try {
      const { groupId, senderId, callType, callId } = data;
      if (this._endedCalls.has(callId)) {
        logger.info(
          `Ignoring duplicate group callEnded for callId: ${callId}, groupId: ${groupId}`
        );
        return;
      }
      logger.info(
        `Received group callEnded from ${senderId} for callId: ${callId}, groupId: ${groupId}, callType: ${callType}`
      );

      const group = await this._groupRepo.getGroupById(groupId);
      if (!group) {
        logger.error(`Invalid group ID: ${groupId}`);
        socket.emit("error", { message: "Invalid group ID" });
        return;
      }

      const recipientIds = group.members
        .filter((member) => member.userId._id.toString() !== senderId)
        .map((member) => member.userId._id.toString());

      const room = `group_${groupId}`;
      // If senderId is leaving, emit userRoomLeft and update call log
      if (senderId && this._joinedUsersByCallId.has(callId)) {
        this._joinedUsersByCallId.get(callId)!.delete(senderId);
        logger.info(`Removed user ${senderId} from call ${callId}`);
        this._io?.to(room).emit("userRoomLeft", { userId: senderId });
        logger.info(
          `Emitted userRoomLeft for user ${senderId} to room ${room}`
        );

        // Update call log only if no users remain
        if (this._joinedUsersByCallId.get(callId)!.size === 0) {
          await updateCallLog(
            socket,
            this._io,
            this._callLogRepo,
            callId,
            senderId,
            recipientIds,
            {
              status: "completed",
              endTime: new Date(),
            }
          );
        }
      } else {
        // Entire call ending
        await updateCallLog(
          socket,
          this._io,
          this._callLogRepo,
          callId,
          senderId,
          recipientIds,
          {
            status: "completed",
            endTime: new Date(),
          }
        );
        this._io?.to(room).emit("groupCallEnded", {
          groupId,
          callId,
        });
      }

      this._endedCalls.add(callId);
      setTimeout(() => this._endedCalls.delete(callId), 60000);

      const call = this._activeOffers.get(callId);
      if (call) {
        clearTimeout(call.endTimeout);
        this._activeOffers.delete(callId);
      }

      // Clean up if no users remain
      if (
        this._joinedUsersByCallId.has(callId) &&
        this._joinedUsersByCallId.get(callId)!.size === 0
      ) {
        this._joinedUsersByCallId.delete(callId);
        this._activeOffers.delete(callId);
        this._groupToCallId.delete(groupId);
        logger.info(`Cleaned up empty call ${callId} for group ${groupId}`);
      }
    } catch (error: any) {
      logger.error(`Error handling group callEnded: ${error.message}`);
      socket.emit("error", { message: "Failed to end group call" });
    }
  }

  public async handleDisconnect(socket: Socket): Promise<void> {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        logger.warn("Disconnect: No userId found in socket data");
        return;
      }
      logger.info(`User ${userId} disconnected from group calls`);

      const rooms = Array.from(socket.rooms).filter((room) =>
        room.startsWith("group_")
      );
      for (const room of rooms) {
        const groupId = room.replace("group_", "");
        const callId = this.getCallIdForGroup(groupId);
        if (callId && this._joinedUsersByCallId.has(callId)) {
          this._joinedUsersByCallId.get(callId)!.delete(userId);
          logger.info(`Removed user ${userId} from call ${callId}`);

          const group = await this._groupRepo.getGroupById(groupId);
          if (!group) {
            logger.error(`Invalid group ID: ${groupId}`);
            continue;
          }

          const recipientIds = group.members
            .filter((member) => member.userId._id.toString() !== userId)
            .map((member) => member.userId._id.toString());

          this._io?.to(room).emit("userRoomLeft", { userId });
          logger.info(
            `Emitted userRoomLeft for user ${userId} to room ${room}`
          );

          if (this._joinedUsersByCallId.get(callId)!.size === 0) {
            await updateCallLog(
              socket,
              this._io,
              this._callLogRepo,
              callId,
              userId,
              recipientIds,
              {
                status: "completed",
                endTime: new Date(),
              }
            );
            this._joinedUsersByCallId.delete(callId);
            this._activeOffers.delete(callId);
            this._groupToCallId.delete(groupId);
            logger.info(`Cleaned up empty call ${callId} for group ${groupId}`);
          }
        }
      }
    } catch (error: any) {
      logger.error(`Error handling group call disconnect: ${error.message}`);
    }
  }

  public async handleJoinGroupCall(
    socket: Socket,
    data: GroupJoinCallData
  ): Promise<void> {
    try {
      const { groupId, userId, callType, callId } = data;
      logger.info(
        `User ${userId} joining group call for groupId: ${groupId}, callId: ${callId}, callType: ${callType}`
      );

      const group = await this._groupRepo.getGroupById(groupId);
      if (!group) {
        logger.error(`Invalid group ID: ${groupId}`);
        socket.emit("error", { message: "Invalid group ID" });
        return;
      }

      const isMember = group.members.some(
        (member) => member.userId._id.toString() === userId
      );
      if (!isMember) {
        logger.error(`User ${userId} is not a member of group ${groupId}`);
        socket.emit("error", { message: "User is not a group member" });
        return;
      }

      const room = `group_${groupId}`;
      socket.join(room);
      logger.info(`User ${userId} joined group call room: ${room}`);

      if (!this._joinedUsersByCallId.has(callId)) {
        this._joinedUsersByCallId.set(callId, new Set());
      }
      this._joinedUsersByCallId.get(callId)!.add(userId);

      this._groupToCallId.set(groupId, callId);
      logger.info(`Mapped groupId ${groupId} to callId ${callId}`);

      const recipientIds = group.members
        .filter((member) => member.userId._id.toString() !== userId)
        .map((member) => member.userId._id.toString());

      // Create call log only when the first user joins
      if (this._joinedUsersByCallId.get(callId)!.size === 1) {
        const sender = await this._userRepo.findById(userId);
        await createCallLog(socket, this._io, this._callLogRepo, {
          CallId: callId,
          chatKey: `group_${groupId}`,
          callType,
          type: "group",
          senderId: userId,
          recipientIds,
          groupId,
          callerName: sender?.name || "Unknown",
        });
      }

      const currentParticipants = Array.from(
        this._joinedUsersByCallId.get(callId) || []
      ).filter((id) => id !== userId);

      socket.emit("joinedGroupCall", {
        groupId,
        callId,
        callType,
        participants: currentParticipants,
      });
      logger.info(`Sent participant list to ${userId}: ${currentParticipants}`);

      const unjoinedMembers = recipientIds.filter(
        (memberId) => !this._joinedUsersByCallId.get(callId)!.has(memberId)
      );
      const sender = await this._userRepo.findById(userId);
      for (const recipId of unjoinedMembers) {
        try {
          const notification = await this._notificationService.sendNotification(
            recipId,
            "incoming_call",
            userId,
            `group_${groupId}`,
            "group",
            callId,
            callType,
            `Incoming group ${callType} call from ${sender?.name || "Group"}`
          );
          this._io?.to(`user_${recipId}`).emit("notification.new", notification);
          logger.info(
            `Sent group call notification to user ${recipId}: ${notification.id}`
          );
        } catch (error: any) {
          logger.warn(
            `Failed to send group call notification to user ${recipId}: ${error.message}`
          );
        }
      }

      this._io?.to(room).emit("userRoomJoined", { userId });
      logger.info(`Emitted userRoomJoined for user ${userId} to ${room}`);

      const endTimeout = setTimeout(async () => {
        const call = this._activeOffers.get(callId);
        if (!call) return;

        const socketsInRoom = await this._io?.in(room).allSockets();
        const connectedUserIds = new Set<string>();
        if (socketsInRoom) {
          for (const socketId of socketsInRoom) {
            const s = this._io?.sockets.sockets.get(socketId);
            if (s && s.data.userId) {
              connectedUserIds.add(s.data.userId);
            }
          }
        }

        for (const recipId of recipientIds) {
          if (!connectedUserIds.has(recipId)) {
            const notification =
              await this._notificationService.updateCallNotificationToMissed(
                recipId,
                callId,
                `Missed group ${callType} call from ${sender?.name || "Group"}`
              );
            if (notification) {
              this._io
                ?.to(`user_${recipId}`)
                .emit("notification.updated", notification);
              logger.info(
                `Emitted notification.updated to user_${recipId}: ${notification.id}`
              );
            } else {
              const newNotification =
                await this._notificationService.sendNotification(
                  recipId,
                  "missed_call",
                  userId,
                  `group_${groupId}`,
                  "group",
                  callId,
                  callType,
                  `Missed group ${callType} call from ${
                    sender?.name || "Group"
                  }`
                );
              this._io
                ?.to(`user_${recipId}`)
                .emit("notification.new", newNotification);
              logger.info(
                `Emitted notification.new to user_${recipId}: ${newNotification.id}`
              );
            }
          }
        }

        // Update call log to missed for unjoined members
        if (unjoinedMembers.length > 0) {
          await updateCallLog(
            socket,
            this._io,
            this._callLogRepo,
            callId,
            userId,
            recipientIds,
            {
              status: "missed",
              endTime: new Date(),
            }
          );
        }

        this._activeOffers.delete(callId);
        this._joinedUsersByCallId.delete(callId);
        this._groupToCallId.delete(groupId);
        logger.info(`Cleaned up timed out call ${callId} for group ${groupId}`);
      }, 30000);

      this._activeOffers.set(callId, {
        senderId: userId,
        recipientIds,
        callType,
        callId,
        endTimeout,
      });
    } catch (error: any) {
      logger.error(`Error handling joinGroupCall: ${error.message}`);
      socket.emit("error", { message: "Failed to join group call" });
    }
  }
}
