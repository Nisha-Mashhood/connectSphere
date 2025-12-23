import { Server, Socket } from "socket.io";
import mongoose from "mongoose";
import logger from "../core/utils/logger";
import Group from "../Models/group-model";
import UserConnection from "../Models/user-connection-model";
import { MarkAsReadData, Message, TypingData } from "./types";
import { inject, injectable } from "inversify";
import { IContactRepository } from "../Interfaces/Repository/i-contact-repositry";
import { IGroupRepository } from "../Interfaces/Repository/i-group-repositry";
import { IChatRepository } from "../Interfaces/Repository/i-chat-repositry";
import { INotificationService } from "../Interfaces/Services/i-notification-service";
import { ICollaborationRepository } from "../Interfaces/Repository/i-collaboration-repositry";
import { IMentor } from "../Interfaces/Models/i-mentor";
import { IUser } from "../Interfaces/Models/i-user";

@injectable()
export class ChatSocketHandler {
  private _activeChats: Map<string, string> = new Map();
  private _contactsRepo: IContactRepository;
  private _groupRepo: IGroupRepository;
  private _chatRepo: IChatRepository;
  private _collabRepository: ICollaborationRepository;
  private _notificationService: INotificationService;
  private _io: Server | null = null;

  constructor(
    @inject("IContactRepository") contactsRepo: IContactRepository,
    @inject("IGroupRepository") groupRepo: IGroupRepository,
    @inject("IChatRepository") chatRepo: IChatRepository,
    @inject("ICollaborationRepository")
    collaboartionRepository: ICollaborationRepository,
    @inject("INotificationService") notificationService: INotificationService
  ) {
    this._contactsRepo = contactsRepo;
    this._groupRepo = groupRepo;
    this._chatRepo = chatRepo;
    this._collabRepository = collaboartionRepository;
    this._notificationService = notificationService;
  }

  public setIo(io: Server): void {
    this._io = io;
  }

  public async handleJoinChats(socket: Socket, userId: string): Promise<void> {
    try {
      const contacts = await this._contactsRepo.findContactsByUserId(userId);
      const rooms = Array.from(
        new Set(
          contacts
            .map((contact) => {
              if (contact.type === "group" && contact.groupId) {
                return `group_${contact.groupId._id.toString()}`;
              } else if (contact.userId && contact.targetUserId) {
                const ids = [
                  contact.userId._id.toString(),
                  contact.targetUserId._id.toString(),
                ].sort();
                return `chat_${ids[0]}_${ids[1]}`;
              }
              return null;
            })
            .filter(Boolean)
        )
      ) as string[];

      socket.join(rooms);
      logger.info(`User ${userId} joined chats: ${rooms.join(", ")}`);
    } catch (error: any) {
      logger.error(`Error joining chats for user ${userId}: ${error.message}`);
      socket.emit("error", { message: "Failed to join chats" });
    }
  }

  public handleJoinUserRoom(socket: Socket, userId: string): void {
    socket.join(`user_${userId}`);
    const roomMembers =  this._io?.sockets.adapter.rooms.get(`user_${userId}`)?.size || 0;
    logger.info(`User ${userId} joined personal room: user_${userId}, socketId=${socket.id}, members=${roomMembers}` );
    this._io?.emit("userOnline", { userId });
    console.log(`[ONLINE] User ${userId} is online (broadcasted)`);
    socket.emit("userOnline", { userId });
  }

  public handleEnsureUserRoom(socket: Socket, data: { userId: string }): void {
    const { userId } = data;
    socket.join(`user_${userId}`);
    const roomMembers =
      this._io?.sockets.adapter.rooms.get(`user_${userId}`)?.size || 0;
    logger.info(
      `Ensured user ${userId} joined room user_${userId}, socketId=${socket.id}, members=${roomMembers}`
    );
    this._io?.to(`user_${userId}`).emit("userRoomJoined", { userId });
  }

  public handleLeaveUserRoom(socket: Socket, userId: string): void {
    socket.leave(`user_${userId}`);
    logger.info(
      `User ${userId} left personal room: user_${userId}, socketId=${socket.id}`
    );
  }

  public handleActiveChat(data: { userId: string; chatKey: string }): void {
    const { userId, chatKey } = data;
    this._activeChats.set(userId, chatKey);
    logger.info(`User ${userId} set active chat: ${chatKey}`);
  }

  public async handleSendMessage(
    socket: Socket,
    message: Message
  ): Promise<void> {
    logger.info("RAW MESSAGE RECEIVED:", JSON.stringify(message, null, 2));
    logger.info("[DEBUG 1] handleSendMessage called");

    try {
      const {
        senderId,
        targetId,
        type,
        content,
        contentType = "text",
        collaborationId,
        userConnectionId,
        groupId,
        _id,
      } = message;

      if (!senderId || !targetId || !type || !content) {
        logger.error("Missing required fields in message");
        socket.emit("error", { message: "Missing required fields" });
        return;
      }

      const timestamp = new Date();
      let room: string = "";
      let savedMessage: any = null;

      const senderObjectId = new mongoose.Types.ObjectId(senderId);

      // ====================== SAVE MESSAGE ======================
      if (contentType === "text") {
        if (type === "group") {
          const group = await this._groupRepo.getGroupById(targetId);
          logger.info(`Group details : ${group}`);
          if (!group) {
            logger.error("Invalid group ID:", targetId);
            socket.emit("error", { message: "Invalid group ID" });
            return;
          }
          const isMember = await this._groupRepo.isUserInGroup(
            targetId,
            senderId
          );
          logger.info(`isMember : ${isMember}`);
          if (!isMember) {
            logger.error("Sender not in group");
            socket.emit("error", { message: "Not a group member" });
            return;
          }
          room = `group_${targetId}`;
          savedMessage = await this._chatRepo.saveChatMessage({
            senderId: senderObjectId,
            groupId: new mongoose.Types.ObjectId(groupId || targetId),
            content,
            contentType,
            timestamp,
            isRead: false,
            status: "sent",
          });
        } else {
          // user-user or user-mentor
          const contact = await this._contactsRepo.findContactByUsers(
            senderId,
            targetId
          );
          if (!contact || !contact._id) {
            logger.error("Contact not found for users:", senderId, targetId);
            socket.emit("error", { message: "Invalid contact" });
            return;
          }

          const ids = [
            contact.userId.toString(),
            contact.targetUserId?.toString(),
          ].sort();
          room = `chat_${ids[0]}_${ids[1]}`;

          savedMessage = await this._chatRepo.saveChatMessage({
            senderId: senderObjectId,
            ...(type === "user-mentor" && {
              collaborationId: new mongoose.Types.ObjectId(
                collaborationId || contact.collaborationId?.toString()
              ),
            }),
            ...(type === "user-user" && {
              userConnectionId: new mongoose.Types.ObjectId(
                userConnectionId || contact.userConnectionId?.toString()
              ),
            }),
            content,
            contentType,
            timestamp,
            isRead: false,
            status: "sent",
          });
        }
      } else {
        // Non-text (image, file, etc.) — assume already saved
        if (!_id) {
          socket.emit("error", { message: "Non-text message requires _id" });
          return;
        }
        savedMessage = await this._chatRepo.findChatMessageById(_id);
        if (!savedMessage) {
          socket.emit("error", { message: "Message not found" });
          return;
        }
        room =
          type === "group"
            ? `group_${targetId}`
            : `chat_${[senderId, targetId].sort().join("_")}`;

            savedMessage.status = "sent";
            await savedMessage.save();
      }

      if (!savedMessage) {
        logger.error("Failed to save message");
        socket.emit("error", { message: "Failed to save message" });
        return;
      }

      logger.info(`[DEBUG 2] Message saved successfully, ${savedMessage}`);
      logger.info(`Message Id :",${savedMessage._id.toString()}`);
      logger.info(
        `collaboartionId : ${savedMessage.collaborationId?.toString() || null}`
      );
      logger.info(
        `userConnectionId : ${
          savedMessage.userConnectionId?.toString() || null
        }`
      );
      logger.info(`GroupId : ${savedMessage.groupId?.toString() || null}`);

      // ====================== BUILD messageData (common for both types) ======================
    const messageData = {
        senderId,
        targetId,
        type,
        content: savedMessage.content || content,
        contentType,
        thumbnailUrl: savedMessage.thumbnailUrl,
        fileMetadata: savedMessage.fileMetadata,
        ...(type === "group" && {
          groupId: savedMessage.groupId?.toString() || targetId,
        }),
        ...(type === "user-mentor" && {
          collaborationId: savedMessage.collaborationId?.toString(),
        }),
        ...(type === "user-user" && {
          userConnectionId: savedMessage.userConnectionId?.toString(),
        }),
        timestamp: savedMessage.timestamp.toISOString(),
        _id: savedMessage._id.toString(),
        status: savedMessage.status,
        isRead: savedMessage.isRead || false,
      };

      // ====================== DETERMINE CHATKEY & RECIPIENTS ======================
      let chatKey: string | null = null;
      const recipientIds: string[] = [];

      if (type === "group" && savedMessage.groupId) {
        chatKey = `group_${savedMessage.groupId.toString()}`;
        const group = await Group.findById(savedMessage.groupId);
        if (group) {
          recipientIds.push( ...group.members .filter((m) => m.userId.toString() !== senderId)
              .map((m) => m.userId.toString())
          );
        }
      } else if (type === "user-mentor" && savedMessage.collaborationId) {
        chatKey = `user-mentor_${savedMessage.collaborationId.toString()}`;
        const collab = await this._collabRepository.findCollabById(
          savedMessage.collaborationId
        );
        if (collab) {
          let mentorUserId: string | null = null;

          if (typeof collab.mentorId === "object" && collab.mentorId !== null) {
            const mentorObj = collab.mentorId as IMentor;
            if (typeof mentorObj.userId === "object" && mentorObj.userId !== null && "_id" in mentorObj.userId ) {
              mentorUserId = mentorObj.userId._id.toString();
            }
          }

          if (!mentorUserId) {
            mentorUserId = collab.mentorId?.toString() || null;
          }
          let userUserId: string | null = null;

          if ( typeof collab.userId === "object" && collab.userId !== null && "_id" in collab.userId ) {
            userUserId = (collab.userId as IUser)._id.toString();
          } else {
            userUserId = collab.userId?.toString() || null;
          }
          const recipient = userUserId === senderId ? mentorUserId : userUserId;

          if (recipient && recipient !== senderId) {
            recipientIds.push(recipient);
          }
        }
      } else if (type === "user-user" && savedMessage.userConnectionId) {
        chatKey = `user-user_${savedMessage.userConnectionId.toString()}`;
        const conn = await UserConnection.findById(
          savedMessage.userConnectionId
        );
        if (conn) {
          const recipient =
            conn.requester.toString() === senderId
              ? conn.recipient.toString()
              : conn.requester.toString();
          if (recipient !== senderId) recipientIds.push(recipient);
        }
      }

      if (!chatKey || recipientIds.length === 0) {
        logger.warn("No valid chatKey or recipients → skipping notifications"
        );
      } else if (this._io) {
        logger.info("Starting notification + contactsUpdated for", recipientIds.length, "users" );

        // === SEND NOTIFICATIONS ===
        for (const recipientId of recipientIds) {
          try {
            let relatedId: string | null = null;

            if (type === "group") {
              relatedId = savedMessage.groupId?.toString() || null;
            } else if (type === "user-mentor") {
              relatedId = savedMessage.collaborationId?.toString() || null;
            } else if (type === "user-user") {
              relatedId = savedMessage.userConnectionId?.toString() || null;
            }
            const notification =
              await this._notificationService.sendNotification(
                recipientId,
                "message",
                senderId,
                relatedId!,
                type === "group" ? "group" : type === "user-mentor" ? "collaboration" : "userconnection"
              );
            // Auto-mark as read if recipient is actively viewing this chat
            const activeChat = this._activeChats.get(recipientId);
            if (activeChat === chatKey && notification.status === "unread") {
              await this._notificationService.markNotificationAsRead(
                notification.id
              );
              this._io
                .to(`user_${recipientId}`)
                .emit("notification.read", { notificationId: notification.id });
            }
          } catch (err: any) {
            logger.error( `[NOTIFY ERROR] Failed for ${recipientId}:`, err.message );
          }
        }
        // === EMIT contactsUpdated TO REFRESH UNREAD COUNTS ===
        const allUsers = [...new Set([senderId, ...recipientIds])];
        for (const userId of allUsers) {
          this._io.to(`user_${userId}`).emit("contactsUpdated");
        }
      }
      // ====================== BROADCAST MESSAGE ======================
      socket.broadcast.to(room).emit("receiveMessage", messageData);
      socket.emit("messageSaved", messageData);
    } catch (error: any) {
      logger.error(
        "[FATAL] handleSendMessage crashed:",
        error.message,
        error.stack
      );
      socket.emit("error", { message: "Failed to send message" });
    }
  }

  public handleTyping(socket: Socket, data: TypingData): void {
    const { userId, targetId, type, chatKey } = data;
    let room: string;
    if (type === "group") {
      room = `group_${targetId}`;
    } else {
      const ids = [userId, targetId].sort();
      room = `chat_${ids[0]}_${ids[1]}`;
    }
    socket.broadcast.to(room).emit("typing", { userId, chatKey });
    logger.info(
      `Broadcasting typing to room ${room}: userId=${userId}, chatKey=${chatKey}`
    );
  }

  public handleStopTyping(socket: Socket, data: TypingData): void {
    const { userId, targetId, type, chatKey } = data;
    let room: string;
    if (type === "group") {
      room = `group_${targetId}`;
    } else {
      const ids = [userId, targetId].sort();
      room = `chat_${ids[0]}_${ids[1]}`;
    }
    socket.to(room).emit("stopTyping", { userId, chatKey });
    logger.info(
      `Broadcasting stopTyping to room ${room}: userId=${userId}, chatKey=${chatKey}`
    );
  }

  public async handleMarkAsRead(
  socket: Socket,
  data: MarkAsReadData
): Promise<void> {
  try {
    const { chatKey, userId, type } = data;
    const updatedMessages = await this._chatRepo.markMessagesAsRead(
      chatKey,
      userId,
      type
    );
    const notifications = await this._notificationService.getNotifications(
      userId
    );
    const messageNotifications = notifications.filter(
      (n) =>
        n.type === "message" &&
        n.relatedId === chatKey &&
        n.status === "unread"
    );
    for (const notification of messageNotifications) {
      const updatedNotification =
        await this._notificationService.markNotificationAsRead(
          notification.id.toString()
        );
      if (updatedNotification && this._io) {
        this._io
          .to(`user_${userId}`)
          .emit("notification.read", { notificationId: notification.id });
      }
    }
    let room: string;
    if (type === "group") {
      room = `group_${chatKey.replace("group_", "")}`;
    } else {
      const contact = await this._contactsRepo.findContactByUsers(
        userId,
        chatKey.replace(/^(user-mentor_|user-user_)/, "")
      );
      const ids = [
        contact?.userId.toString(),
        contact?.targetUserId?.toString(),
      ].sort();
      room = `chat_${ids[0]}_${ids[1]}`;
    }
    console.log(`[READ EMIT] Emitting messagesRead to room ${room}`, { chatKey, userId, messageIds: updatedMessages });
    this._io?.to(room).emit("messagesRead", { chatKey, userId, messageIds: updatedMessages });

    // NEW: Emit to personal rooms for 1-on-1 chats
    let otherUsers: string[] = [];
    if (type === "user-user") {
      const connId = chatKey.replace("user-user_", "");
      const conn = await UserConnection.findById(connId);
      if (conn) {
        const otherUser = conn.requester.toString() === userId ? conn.recipient.toString() : conn.requester.toString();
        otherUsers.push(otherUser);
      }
    } else if (type === "user-mentor") {
        const collabId = chatKey.replace("user-mentor_", "");
        const collab = await this._collabRepository.findCollabById(collabId);
        if (collab) {
          let mentorUserId: string | null = null;
          if (typeof collab.mentorId === "object" && collab.mentorId !== null) {
            const mentorObj = collab.mentorId as IMentor;
            if (mentorObj.userId) {
              mentorUserId = typeof mentorObj.userId === "object" 
                ? (mentorObj.userId as IUser)._id.toString()
                : mentorObj.userId
            }
          } else if (collab.mentorId) {
            mentorUserId = collab.mentorId.toString();
          }

          let userUserId: string | null = null;
          if (typeof collab.userId === "object" && collab.userId !== null) {
            userUserId = (collab.userId as IUser)._id.toString();
          } else if (collab.userId) {
            userUserId = collab.userId.toString();
          }

          if (mentorUserId && userUserId) {
            const otherUser = userUserId === userId ? mentorUserId : userUserId;
            if (otherUser && otherUser !== userId) {
              otherUsers.push(otherUser);
            }
          }
        }
      } else if (type === "group") {
      const groupId = chatKey.replace("group_", "");
      const group = await this._groupRepo.getGroupById(groupId);
      if (group) {
        otherUsers = group.members
          .filter(m => m.userId.toString() !== userId)
          .map(m => m.userId.toString());
      }
    }

    // Emit to all other users' personal rooms
    otherUsers.forEach(otherId => {
      console.log(`[READ EMIT] Emitting to personal room user_${otherId}`);
      this._io?.to(`user_${otherId}`).emit("messagesRead", { chatKey, userId, messageIds: updatedMessages });
    });

    logger.info(`Marked messages as read for user ${userId} in chat ${chatKey}`);
  } catch (error: any) {
    logger.error(`Error marking messages as read: ${error.message}`);
    socket.emit("error", { message: "Failed to mark messages as read" });
  }
}


  public handleLeaveChat(userId: string): void {
    try {
      this._activeChats.delete(userId);
      logger.info(`User ${userId} left all chats — activeChat cleared`);
    } catch (err: any) {
      logger.error(`Failed to handle leaveChat for ${userId}: ${err.message}`);
    }
  }
}
