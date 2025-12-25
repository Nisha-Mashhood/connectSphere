import { Server, Socket } from "socket.io";
import logger from "../core/utils/logger";
import { CallData, CallOffer } from "../Utils/types/socket-service-types";
import { createCallLog, updateCallLog } from "./Utils/call-log-helper";
import { inject, injectable } from "inversify";
import { ICallSocketHandler } from "../Interfaces/Services/i-call-socket-handler";
import { IContactRepository } from "../Interfaces/Repository/i-contact-repositry";
import { IGroupRepository } from "../Interfaces/Repository/i-group-repositry";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { INotificationService } from "../Interfaces/Services/i-notification-service";
import { ICallLogRepository } from "../Interfaces/Repository/i-call-repositry";
import { CallCreatedEvent } from "./types";

@injectable()
export class CallSocketHandler implements ICallSocketHandler{
  private _activeOffers: Map<string, CallOffer> = new Map();
  private _endedCalls: Set<string> = new Set();
  private _contactsRepo: IContactRepository;
  private _groupRepo: IGroupRepository;
  private _userRepo: IUserRepository;
  private _notificationService: INotificationService;
  private _callLogRepo: ICallLogRepository;
  private _io: Server | null = null;

  constructor(
    @inject("IContactRepository") contactsRepo: IContactRepository,
    @inject("IGroupRepository") groupRepo: IGroupRepository,
    @inject("IUserRepository") userRepo: IUserRepository,
    @inject("INotificationService") notificationService: INotificationService,
    @inject("ICallLogRepository") callLogRepo: ICallLogRepository
  ) {
    this._contactsRepo = contactsRepo;
    this._groupRepo = groupRepo;
    this._userRepo = userRepo;
    this._notificationService = notificationService;
    this._callLogRepo = callLogRepo;
    logger.debug(
      `CallSocketHandler initialized with callLogRepo: ${!!callLogRepo}`
    );
    if (!callLogRepo) {
      logger.error("CallLogRepository is not initialized");
      throw new Error("CallLogRepository is required");
    }
  }

  public setIo(io: Server): void {
    this._io = io;
  }

  
public async handleOffer(socket: Socket, data: CallData): Promise<void> {
  try {
    const { userId, targetId, type, chatKey, offer, callType } = data;
    logger.info(`Received ${callType} offer from ${userId} for chatKey: ${chatKey}`);

    let room: string;
    let recipientIds: string[] = [];
    let contentType: "group" | "collaboration" | "userconnection";

    if (type === "group") {
      // group call path (we are not implementing full group flow yet, but keep logic consistent)
      room = `group_${targetId}`;
      contentType = "group";
      const group = await this._groupRepo.getGroupById(targetId);
      if (!group) {
        logger.error(`Invalid group ID: ${targetId}`);
        socket.emit("error", { message: "Invalid group ID" });
        return;
      }
      recipientIds = group.members
        .filter((member) => member.userId.toString() !== userId)
        .map((member) => member.userId.toString());
    } else {
      // one-on-one (user-user or user-mentor)
      const contact = await this._contactsRepo.findContactByUsers(userId, targetId);
      if (!contact) {
        logger.error(`Invalid contact for offer: userId=${userId}, targetId=${targetId}`);
        socket.emit("error", { message: "Invalid contact" });
        return;
      }
      const ids = [contact.userId.toString(), contact.targetUserId?.toString()].sort();
      room = `chat_${ids[0]}_${ids[1]}`;
      recipientIds = [targetId];
      contentType = contact.type === "user-mentor" ? "collaboration" : "userconnection";
    }

    const callId = `${chatKey}_${Date.now()}`;
    // Broadcast the offer to the room (recipient(s) will receive it)
    socket.broadcast.to(room).emit("offer", {
      userId,
      targetId,
      type,
      chatKey,
      offer,
      callType,
      callId,
      senderName: (await this._userRepo.findById(userId))?.name || "Unknown",
    });

    // Create server-side callId and call log
    const sender = await this._userRepo.findById(userId);
    const callLog = await createCallLog(socket, this._io, this._callLogRepo, {
      CallId: callId,
      chatKey,
      callType,
      type,
      senderId: userId,
      recipientIds,
      groupId: type === "group" ? targetId : undefined,
      callerName: sender?.name || "Unknown",
    });

    if (!callLog) {
      logger.error(`Failed to create call log for callId: ${callId}`);
      socket.emit("error", { message: "Failed to create call record" });
      return;
    }

    // Notify the offerer (the socket that sent the offer) with server-generated callId and metadata
    const createdEvent: CallCreatedEvent = {
      callId,
      chatKey,
      callType,
      type,
      senderId: userId,
      recipientIds,
      groupId: type === "group" ? targetId : undefined,
      callerName: sender?.name || "Unknown",
      createdAt: new Date().toISOString(),
    };

    socket.emit("call.created", createdEvent);
    logger.info(`Emitted call.created to offerer ${userId} with callId ${callId}`);

    // send incoming call notifications for each recipient (non-blocking)
    for (const recipientId of recipientIds) {
      try {
        const notification = await this._notificationService.sendNotification(
          recipientId,
          "incoming_call",
          userId,
          chatKey,
          contentType,
          callId,
          callType,
          `incoming ${callType} call from ${sender?.name || "Unknown"}`
        );

        if (notification && this._io) {
          // if the recipient is connected, notify them directly
          this._io.to(`user_${recipientId}`).emit("notification.new", notification);
        }

        logger.info(`Created call notification for user ${recipientId}: ${notification?.id}`);
      } catch (err) {
        logger.warn(`Failed to send call notification to user ${recipientId}: ${(err as Error).message}`);
      }
    }

    // create end-timeout for unanswered call (30s)
    const endTimeout = setTimeout(async () => {
      const call = this._activeOffers.get(callId);
      if (!call) return;

      // find sockets currently connected in the room to determine who answered
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

      // for each recipient, if they never connected, mark call as missed for that recipient
      for (const recipientId of recipientIds) {
        if (!connectedUserIds.has(recipientId)) {
          const updatedCallLog = await updateCallLog(
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

          if (!updatedCallLog) {
            logger.error(`Failed to update call log to missed for CallId: ${callId}`);
            continue;
          }

          // update notification to missed or create missed notification
          const notification = await this._notificationService.updateCallNotificationToMissed(
            recipientId,
            callId,
            `Missed ${callType} call from ${userId}`
          );

          if (notification && this._io) {
            this._io.to(`user_${recipientId}`).emit("notification.updated", notification);
          } else {
            // fallback: create missed notification
            const newNotification = await this._notificationService.sendNotification(
              recipientId,
              "missed_call",
              userId,
              chatKey,
              contentType,
              callId,
              callType,
              `Missed ${callType} call from ${sender?.name || "Unknown"}`
            );
            if (this._io && newNotification) {
              this._io.to(`user_${recipientId}`).emit("notification.new", newNotification);
            }
          }
        }
      }

      // inform all sockets in the room that call ended (missed)
      socket.to(room).emit("callEnded", { userId, targetId, type, chatKey, callType, callId, reason: "missed" });
      socket.emit("callEnded", { userId, targetId, type, chatKey, callType, callId, reason: "missed" });

      // cleanup
      this._activeOffers.delete(callId);
      logger.info(`Call ${callId} marked missed and cleaned up after timeout`);
    }, 30000);

    // store active offer with endTimeout
    const callOffer: CallOffer = {
      senderId: userId,
      targetId,
      type,
      chatKey,
      callType,
      recipientIds,
      endTimeout,
    };

    this._activeOffers.set(callId, callOffer);
    logger.info(`Stored active offer for callId ${callId}`);
  } catch (error) {
    logger.error(`Error broadcasting offer: ${(error as Error).message}`);
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
        const contact = await this._contactsRepo.findContactByUsers(
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

      const callId = Array.from(this._activeOffers.keys()).find(
        (id) =>
          this._activeOffers.get(id)?.chatKey === chatKey &&
          this._activeOffers.get(id)?.senderId === targetId
      );
      if (callId) {
        const call = this._activeOffers.get(callId);
        if (call) {
          clearTimeout(call.endTimeout);
          this._activeOffers.delete(callId);
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
        const contact = await this._contactsRepo.findContactByUsers(
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
      const callId = Array.from(this._activeOffers.keys()).find(
        (id) =>
          this._activeOffers.get(id)?.chatKey === chatKey &&
          this._activeOffers.get(id)?.senderId === userId
      );
      if (!callId || this._endedCalls.has(callId)) {
        logger.info(
          `Ignoring duplicate or invalid callEnded for callId: ${callId}, chatKey: ${chatKey}`
        );
        return;
      }
      logger.info(
        `Received callEnded from ${userId} for chatKey: ${chatKey}, callType: ${callType}`
      );

      let room: string;
      let recipientIds: string[] = [];
      if (type === "group") {
        room = `group_${targetId}`;
        const group = await this._groupRepo.getGroupById(targetId);
        if (!group) {
          logger.error(`Invalid group ID: ${targetId}`);
          socket.emit("error", { message: "Invalid group ID" });
          return;
        }
        recipientIds = group.members
          .filter((member) => member.userId.toString() !== userId)
          .map((member) => member.userId.toString());
      } else {
        const contact = await this._contactsRepo.findContactByUsers(
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
        recipientIds = [targetId];
      }

      // Update call log
      const updatedCallLog = await updateCallLog(
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

      if (!updatedCallLog) {
        logger.error(
          `Failed to update call log to completed for CallId: ${callId}`
        );
        return;
      }
      this._io
        ?.to(room)
        .emit("callEnded", { userId, targetId, type, chatKey, callType });
      this._endedCalls.add(callId);
      setTimeout(() => this._endedCalls.delete(callId), 60000);

      const call = this._activeOffers.get(callId);
      if (call) {
        clearTimeout(call.endTimeout);
        this._activeOffers.delete(callId);
      }
    } catch (error: any) {
      logger.error(`Error handling callEnded: ${error.message}`);
      socket.emit("error", { message: "Failed to end call" });
    }
  }
}
