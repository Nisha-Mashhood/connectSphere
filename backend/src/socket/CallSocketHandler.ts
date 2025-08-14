import { Server, Socket } from "socket.io";
import logger from "../core/Utils/Logger";
import { ContactRepository } from "../Modules/Contact/Repositry/ContactRepositry";
import { GroupRepository } from "../Modules/Group/Repositry/GroupRepositry";
import { UserRepository } from "../Modules/Auth/Repositry/UserRepositry";
import { NotificationService } from "../Modules/Notification/Service/NotificationService";
import { CallData, CallOffer } from "./types";

export class CallSocketHandler {
  private activeOffers: Map<string, CallOffer> = new Map();
  private endedCalls: Set<string> = new Set();
  private contactsRepo: ContactRepository;
  private groupRepo: GroupRepository;
  private userRepo: UserRepository;
  private notificationService: NotificationService;
  private io: Server | null = null;

  constructor(
    contactsRepo: ContactRepository,
    groupRepo: GroupRepository,
    userRepo: UserRepository,
    notificationService: NotificationService
  ) {
    this.contactsRepo = contactsRepo;
    this.groupRepo = groupRepo;
    this.userRepo = userRepo;
    this.notificationService = notificationService;
  }

  public setIo(io: Server): void {
    this.io = io;
  }

  public async handleOffer(socket: Socket, data: CallData): Promise<void> {
      try {
        const { userId, targetId, type, chatKey, offer, callType } = data;
        logger.info(
          `Received ${callType} offer from ${userId} for chatKey: ${chatKey}`
        );
        let room: string;
        let recipientIds: string[] = [];
  
        if (type === "group") {
          room = `group_${targetId}`;
          const group = await this.groupRepo.getGroupById(targetId);
          if (!group) {
            logger.error(`Invalid group ID: ${targetId}`);
            socket.emit("error", { message: "Invalid group ID" });
            return;
          }
          recipientIds = group.members
            .filter((member) => member.userId.toString() !== userId)
            .map((member) => member.userId.toString());
        } else {
          const contact = await this.contactsRepo.findContactByUsers(
            userId,
            targetId
          );
          if (!contact) {
            logger.error(
              `Invalid contact for offer: userId=${userId}, targetId=${targetId}`
            );
            socket.emit("error", { message: "Invalid contact" });
            return;
          }
          const ids = [
            contact.userId.toString(),
            contact.targetUserId?.toString(),
          ].sort();
          room = `chat_${ids[0]}_${ids[1]}`;
          recipientIds = [targetId];
        }
  
        const sender = await this.userRepo.findById(userId);
        socket.broadcast.to(room).emit("offer", {
          userId,
          targetId,
          type,
          chatKey,
          offer,
          callType,
          senderName: sender?.name,
        });
  
        const callId = `${chatKey}_${Date.now()}`;
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
  
        for (const recipientId of recipientIds) {
          try {
            const notification = await this.notificationService.sendNotification(
              recipientId,
              "incoming_call",
              userId,
              chatKey,
              callType,
              callId
            );
            logger.info(
              `Created call notification for user ${recipientId}: ${notification._id}`
            );
          } catch (error: any) {
            logger.warn(
              `Failed to send call notification to user ${recipientId}: ${error.message}`
            );
          }
        }
  
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
  
          for (const recipientId of recipientIds) {
            if (!connectedUserIds.has(recipientId)) {
              const notification =
                await this.notificationService.updateCallNotificationToMissed(
                  recipientId,
                  callId,
                  `Missed ${callType} call from ${userId}`
                );
              if (notification && this.io) {
                this.io
                  .to(`user_${recipientId}`)
                  .emit("notification.updated", notification);
              } else {
                logger.info(
                  `No incoming call notification found for call ${callId}, creating new`
                );
                const newNotification =
                  await this.notificationService.sendNotification(
                    recipientId,
                    "missed_call",
                    userId,
                    chatKey,
                    callType,
                    callId
                  );
                logger.info(
                  `Emitted notification.new to user_${recipientId}: ${newNotification._id}`
                );
              }
            }
          }
  
          socket
            .to(room)
            .emit("callEnded", { userId, targetId, type, chatKey, callType });
          socket.emit("callEnded", { userId, targetId, type, chatKey, callType });
          this.activeOffers.delete(callId);
        }, 30000);
  
        this.activeOffers.set(callId, {
          senderId: userId,
          targetId,
          type,
          chatKey,
          callType,
          recipientIds,
          endTimeout,
        });
      } catch (error: any) {
        logger.error(`Error broadcasting offer: ${error.message}`);
        socket.emit("error", { message: "Failed to send offer" });
      }
    }
  
    public async handleAnswer(socket: Socket, data: CallData): Promise<void> {
      try {
        const { userId, targetId, type, chatKey, answer, callType } = data;
        logger.info(
          `Received ${callType} answer from ${userId} for chatKey: ${chatKey}`
        );
        let room: string;
  
        if (type === "group") {
          room = `group_${targetId}`;
        } else {
          const contact = await this.contactsRepo.findContactByUsers(
            userId,
            targetId
          );
          if (!contact) {
            logger.error(
              `Invalid contact for answer: userId=${userId}, targetId=${targetId}`
            );
            socket.emit("error", { message: "Invalid contact" });
            return;
          }
          const ids = [
            contact.userId.toString(),
            contact.targetUserId?.toString(),
          ].sort();
          room = `chat_${ids[0]}_${ids[1]}`;
        }
  
        socket.broadcast
          .to(room)
          .emit("answer", { userId, targetId, type, chatKey, answer, callType });
  
        const callId = Array.from(this.activeOffers.keys()).find(
          (id) =>
            this.activeOffers.get(id)?.chatKey === chatKey &&
            this.activeOffers.get(id)?.senderId === targetId
        );
        if (callId) {
          const call = this.activeOffers.get(callId);
          if (call) {
            clearTimeout(call.endTimeout);
            this.activeOffers.delete(callId);
          }
        }
      } catch (error: any) {
        logger.error(`Error broadcasting answer: ${error.message}`);
        socket.emit("error", { message: "Failed to send answer" });
      }
    }
  
    public async handleIceCandidate(
      socket: Socket,
      data: CallData
    ): Promise<void> {
      try {
        const { userId, targetId, type, chatKey, candidate, callType } = data;
        logger.info(
          `Received ${callType} ICE candidate from ${userId} for chatKey: ${chatKey}`
        );
        let room: string;
  
        if (type === "group") {
          room = `group_${targetId}`;
        } else {
          const contact = await this.contactsRepo.findContactByUsers(
            userId,
            targetId
          );
          if (!contact) {
            logger.error(
              `Invalid contact for ICE candidate: userId=${userId}, targetId=${targetId}`
            );
            socket.emit("error", { message: "Invalid contact" });
            return;
          }
          const ids = [
            contact.userId.toString(),
            contact.targetUserId?.toString(),
          ].sort();
          room = `chat_${ids[0]}_${ids[1]}`;
        }
  
        socket.broadcast.to(room).emit("ice-candidate", {
          userId,
          targetId,
          type,
          chatKey,
          candidate,
          callType,
        });
      } catch (error: any) {
        logger.error(`Error broadcasting ICE candidate: ${error.message}`);
        socket.emit("error", { message: "Failed to send ICE candidate" });
      }
    }
  
    public async handleCallEnded(socket: Socket, data: CallData): Promise<void> {
      try {
        const { userId, targetId, type, chatKey, callType } = data;
        const callId = `${chatKey}_${Date.now()}`;
        if (this.endedCalls.has(callId)) {
          logger.info(
            `Ignoring duplicate callEnded for callId: ${callId}, chatKey: ${chatKey}`
          );
          return;
        }
        logger.info(
          `Received callEnded from ${userId} for chatKey: ${chatKey}, callType: ${callType}`
        );
        let room: string;
  
        if (type === "group") {
          room = `group_${targetId}`;
        } else {
          const contact = await this.contactsRepo.findContactByUsers(
            userId,
            targetId
          );
          if (!contact) {
            logger.error(
              `Invalid contact for callEnded: userId=${userId}, targetId=${targetId}`
            );
            socket.emit("error", { message: "Invalid contact" });
            return;
          }
          const ids = [
            contact.userId.toString(),
            contact.targetUserId?.toString(),
          ].sort();
          room = `chat_${ids[0]}_${ids[1]}`;
        }
  
        this.io
          ?.to(room)
          .emit("callEnded", { userId, targetId, type, chatKey, callType });
        this.endedCalls.add(callId);
        setTimeout(() => this.endedCalls.delete(callId), 60000);
  
        const callIdToClear = Array.from(this.activeOffers.keys()).find(
          (id) =>
            this.activeOffers.get(id)?.chatKey === chatKey &&
            this.activeOffers.get(id)?.senderId === userId
        );
        if (callIdToClear) {
          const call = this.activeOffers.get(callIdToClear);
          if (call) {
            clearTimeout(call.endTimeout);
            this.activeOffers.delete(callIdToClear);
          }
        }
      } catch (error: any) {
        logger.error(`Error handling callEnded: ${error.message}`);
        socket.emit("error", { message: "Failed to end call" });
      }
    }
    
}