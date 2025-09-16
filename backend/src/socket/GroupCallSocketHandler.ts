import { Server, Socket } from "socket.io";
import logger from "../Core/Utils/Logger";
import { GroupRepository } from "../Repositories/Group.repository";
import { UserRepository } from "../Repositories/User.repository";
import { NotificationService } from "..//Services/Notification.service";
import { CallLogRepository } from "../Repositories/Call.repository";
import {
  createCallLog,
  updateCallLog,
} from "./Utils/CallLogHelper";

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

export class GroupCallSocketHandler {
  private activeOffers: Map<string, GroupCallOffer> = new Map();
  private endedCalls: Set<string> = new Set();
  private joinedUsersByCallId: Map<string, Set<string>> = new Map();
  private groupRepo: GroupRepository;
  private userRepo: UserRepository;
  private notificationService: NotificationService;
  private callLogRepo: CallLogRepository;
  private io: Server | null = null;
  private groupToCallId: Map<string, string> = new Map();

  constructor(
    groupRepo: GroupRepository,
    userRepo: UserRepository,
    notificationService: NotificationService,
    callLogRepo: CallLogRepository
  ) {
    this.groupRepo = groupRepo;
    this.userRepo = userRepo;
    this.notificationService = notificationService;
    this.callLogRepo = callLogRepo;
  }

  public setIo(io: Server): void {
    this.io = io;
  }

  public getCallIdForGroup(groupId: string): string | undefined {
    return this.groupToCallId.get(groupId);
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

      const group = await this.groupRepo.getGroupById(groupId);
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
      const socketsInRoom = await this.io?.in(recipientSocketRoom).allSockets();
      if (!socketsInRoom || socketsInRoom.size === 0) {
        logger.warn(
          `No sockets found in room ${recipientSocketRoom} for recipient ${recipientId}`
        );
        return;
      }

      const sender = await this.userRepo.findById(senderId);
      logger.info(
        `Emitting groupOffer to ${recipientSocketRoom} for recipient ${recipientId}`
      );
      this.io?.to(recipientSocketRoom).emit("groupOffer", {
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

      const group = await this.groupRepo.getGroupById(groupId);
      if (!group) {
        logger.error(`Invalid group ID: ${groupId}`);
        socket.emit("error", { message: "Invalid group ID" });
        return;
      }

      const recipientSocketRoom = `user_${recipientId}`;
      const socketsInRoom = await this.io?.in(recipientSocketRoom).allSockets();
      if (!socketsInRoom || socketsInRoom.size === 0) {
        logger.warn(
          `No sockets found in room ${recipientSocketRoom} for recipient ${recipientId}`
        );
        return;
      }

      logger.info(
        `Emitting groupAnswer to ${recipientSocketRoom} for recipient ${recipientId}`
      );
      this.io?.to(recipientSocketRoom).emit("groupAnswer", {
        groupId,
        senderId,
        recipientId,
        answer,
        callType,
        callId,
      });

      const call = this.activeOffers.get(callId);
      if (call) {
        clearTimeout(call.endTimeout);
        this.activeOffers.delete(callId);
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

      const group = await this.groupRepo.getGroupById(groupId);
      if (!group) {
        logger.error(`Invalid group ID: ${groupId}`);
        socket.emit("error", { message: "Invalid group ID" });
        return;
      }

      this.io?.to(`user_${recipientId}`).emit("groupIceCandidate", {
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
      if (this.endedCalls.has(callId)) {
        logger.info(
          `Ignoring duplicate group callEnded for callId: ${callId}, groupId: ${groupId}`
        );
        return;
      }
      logger.info(
        `Received group callEnded from ${senderId} for callId: ${callId}, groupId: ${groupId}, callType: ${callType}`
      );

      const group = await this.groupRepo.getGroupById(groupId);
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
      if (senderId && this.joinedUsersByCallId.has(callId)) {
        this.joinedUsersByCallId.get(callId)!.delete(senderId);
        logger.info(`Removed user ${senderId} from call ${callId}`);
        this.io?.to(room).emit("userRoomLeft", { userId: senderId });
        logger.info(
          `Emitted userRoomLeft for user ${senderId} to room ${room}`
        );

        // Update call log only if no users remain
        if (this.joinedUsersByCallId.get(callId)!.size === 0) {
          await updateCallLog(
            socket,
            this.io,
            this.callLogRepo,
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
          this.io,
          this.callLogRepo,
          callId,
          senderId,
          recipientIds,
          {
            status: "completed",
            endTime: new Date(),
          }
        );
        this.io?.to(room).emit("groupCallEnded", {
          groupId,
          callId,
        });
      }

      this.endedCalls.add(callId);
      setTimeout(() => this.endedCalls.delete(callId), 60000);

      const call = this.activeOffers.get(callId);
      if (call) {
        clearTimeout(call.endTimeout);
        this.activeOffers.delete(callId);
      }

      // Clean up if no users remain
      if (
        this.joinedUsersByCallId.has(callId) &&
        this.joinedUsersByCallId.get(callId)!.size === 0
      ) {
        this.joinedUsersByCallId.delete(callId);
        this.activeOffers.delete(callId);
        this.groupToCallId.delete(groupId);
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
        if (callId && this.joinedUsersByCallId.has(callId)) {
          this.joinedUsersByCallId.get(callId)!.delete(userId);
          logger.info(`Removed user ${userId} from call ${callId}`);

          const group = await this.groupRepo.getGroupById(groupId);
          if (!group) {
            logger.error(`Invalid group ID: ${groupId}`);
            continue;
          }

          const recipientIds = group.members
            .filter((member) => member.userId._id.toString() !== userId)
            .map((member) => member.userId._id.toString());

          this.io?.to(room).emit("userRoomLeft", { userId });
          logger.info(
            `Emitted userRoomLeft for user ${userId} to room ${room}`
          );

          if (this.joinedUsersByCallId.get(callId)!.size === 0) {
            await updateCallLog(
              socket,
              this.io,
              this.callLogRepo,
              callId,
              userId,
              recipientIds,
              {
                status: "completed",
                endTime: new Date(),
              }
            );
            this.joinedUsersByCallId.delete(callId);
            this.activeOffers.delete(callId);
            this.groupToCallId.delete(groupId);
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

      const group = await this.groupRepo.getGroupById(groupId);
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

      if (!this.joinedUsersByCallId.has(callId)) {
        this.joinedUsersByCallId.set(callId, new Set());
      }
      this.joinedUsersByCallId.get(callId)!.add(userId);

      this.groupToCallId.set(groupId, callId);
      logger.info(`Mapped groupId ${groupId} to callId ${callId}`);

      const recipientIds = group.members
        .filter((member) => member.userId._id.toString() !== userId)
        .map((member) => member.userId._id.toString());

      // Create call log only when the first user joins
      if (this.joinedUsersByCallId.get(callId)!.size === 1) {
        const sender = await this.userRepo.findById(userId);
        await createCallLog(socket, this.io, this.callLogRepo, {
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
        this.joinedUsersByCallId.get(callId) || []
      ).filter((id) => id !== userId);

      socket.emit("joinedGroupCall", {
        groupId,
        callId,
        callType,
        participants: currentParticipants,
      });
      logger.info(`Sent participant list to ${userId}: ${currentParticipants}`);

      const unjoinedMembers = recipientIds.filter(
        (memberId) => !this.joinedUsersByCallId.get(callId)!.has(memberId)
      );
      const sender = await this.userRepo.findById(userId);
      for (const recipId of unjoinedMembers) {
        try {
          const notification = await this.notificationService.sendNotification(
            recipId,
            "incoming_call",
            userId,
            `group_${groupId}`,
            "group",
            callId,
            callType,
            `Incoming group ${callType} call from ${sender?.name || "Group"}`
          );
          this.io?.to(`user_${recipId}`).emit("notification.new", notification);
          logger.info(
            `Sent group call notification to user ${recipId}: ${notification._id}`
          );
        } catch (error: any) {
          logger.warn(
            `Failed to send group call notification to user ${recipId}: ${error.message}`
          );
        }
      }

      this.io?.to(room).emit("userRoomJoined", { userId });
      logger.info(`Emitted userRoomJoined for user ${userId} to ${room}`);

      const endTimeout = setTimeout(async () => {
        const call = this.activeOffers.get(callId);
        if (!call) return;

        const socketsInRoom = await this.io?.in(room).allSockets();
        const connectedUserIds = new Set<string>();
        if (socketsInRoom) {
          for (const socketId of socketsInRoom) {
            const s = this.io?.sockets.sockets.get(socketId);
            if (s && s.data.userId) {
              connectedUserIds.add(s.data.userId);
            }
          }
        }

        for (const recipId of recipientIds) {
          if (!connectedUserIds.has(recipId)) {
            const notification =
              await this.notificationService.updateCallNotificationToMissed(
                recipId,
                callId,
                `Missed group ${callType} call from ${sender?.name || "Group"}`
              );
            if (notification) {
              this.io
                ?.to(`user_${recipId}`)
                .emit("notification.updated", notification);
              logger.info(
                `Emitted notification.updated to user_${recipId}: ${notification._id}`
              );
            } else {
              const newNotification =
                await this.notificationService.sendNotification(
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
              this.io
                ?.to(`user_${recipId}`)
                .emit("notification.new", newNotification);
              logger.info(
                `Emitted notification.new to user_${recipId}: ${newNotification._id}`
              );
            }
          }
        }

        // Update call log to missed for unjoined members
        if (unjoinedMembers.length > 0) {
          await updateCallLog(
            socket,
            this.io,
            this.callLogRepo,
            callId,
            userId,
            recipientIds,
            {
              status: "missed",
              endTime: new Date(),
            }
          );
        }

        this.activeOffers.delete(callId);
        this.joinedUsersByCallId.delete(callId);
        this.groupToCallId.delete(groupId);
        logger.info(`Cleaned up timed out call ${callId} for group ${groupId}`);
      }, 30000);

      this.activeOffers.set(callId, {
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
