import { Server, Socket } from "socket.io";
import { EventEmitter } from "events";
import {
  findContactByUsers,
  findContactsByUserId,
} from "../repositories/contacts.repository.js";
import {
  getGroupsByGroupId,
  isUserInGroup,
} from "../repositories/group.repositry.js";
import {
  findChatMessageById,
  markMessagesAsRead,
  saveChatMessage,
} from "../repositories/chat.repository.js";
import mongoose from "mongoose";
import Group from "../models/group.model.js";
import collaboration from "../models/collaboration.js";
import userConnectionModal from "../models/userConnection.modal.js";
import {
  getNotifications,
  initializeNotificationService,
  markNotificationAsRead,
  sendNotification,
  TaskNotificationPayload,
  updateCallNotificationToMissed,
} from "../services/notification.service.js";
import { findUserById } from "../repositories/user.repositry.js";

let io: Server;
export const notificationEmitter = new EventEmitter();
//sentNotifications Set to track emitted notification _id's
const sentNotifications = new Set<string>();

const initializeSocket = (_io: Server) => {
  io = _io;
  // Initialize notification service
  initializeNotificationService(io);
  console.log("Socket.IO server initialized");

  // Store active call offers with timeouts
  const activeOffers = new Map<
    string,
    {
      senderId: string;
      targetId: string;
      type: string;
      chatKey: string;
      callType: "audio" | "video";
      recipientIds: string[];
      endTimeout: NodeJS.Timeout;
    }
  >();
  const endedCalls = new Set<string>();
  const activeChats = new Map<string, string>(); // userId -> chatKey

  // Subscribe to task notifications
  notificationEmitter.on(
    "notification",
    (notification: TaskNotificationPayload) => {
      emitTaskNotification(notification);
    }
  );

  io.on("connection", (socket: Socket) => {
    const userId = socket.handshake.auth.userId;
    socket.data.userId = userId;
    console.log(`[Socket.IO] New client connected: socketId=${socket.id}, userId=${userId}, auth=${JSON.stringify(socket.handshake.auth)}`);
    socket.on("joinChats", async (userId: string) => {
      try {
        const contacts = await findContactsByUserId(userId);
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
        console.log(`User ${userId} joined rooms:`, rooms);
      } catch (error: any) {
        console.error(`Error joining chats for user ${userId}:`, error.message);
      }
    });

    socket.on("joinUserRoom", (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`[Socket.IO] User ${userId} joined personal room: user_${userId}, socketId=${socket.id}`);
    });

    socket.on("activeChat", (data: { userId: string; chatKey: string }) => {
      const { userId, chatKey } = data;
      activeChats.set(userId, chatKey);
      console.log(`User ${userId} set active chat: ${chatKey}`);
    });

    socket.on(
      "sendMessage",
      async (message: {
        senderId: string;
        targetId: string;
        type: string;
        content: string;
        contentType?: string;
        collaborationId?: string;
        userConnectionId?: string;
        groupId?: string;
        _id?: string;
        thumbnailUrl?: string;
        fileMetadata?: { fileName: string; fileSize: number; mimeType: string };
      }) => {
        try {
          console.log("Received sendMessage event:", message);
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
            console.error("Missing required fields in message:", message);
            socket.emit("error", { message: "Missing required fields" });
            return;
          }

          const timestamp = new Date();
          const timestampString = timestamp.toISOString();
          let room: string;
          let savedMessage;

          const senderObjectId = new mongoose.Types.ObjectId(senderId);

          if (contentType === "text") {
            if (type === "group") {
              const group = await getGroupsByGroupId(targetId);
              if (!group) {
                console.error("Invalid group ID:", targetId);
                socket.emit("error", { message: "Invalid group ID" });
                return;
              }
              const isMember = await isUserInGroup(targetId, senderId);
              if (!isMember) {
                console.error("Sender not in group:", senderId, targetId);
                socket.emit("error", { message: "Sender not in group" });
                return;
              }
              room = `group_${targetId}`;
              savedMessage = await saveChatMessage({
                senderId: senderObjectId,
                groupId: new mongoose.Types.ObjectId(groupId || targetId),
                content,
                contentType,
                timestamp,
                isRead: false,
                status: "sent",
              });
            } else {
              const contact = await findContactByUsers(senderId, targetId);
              if (!contact || !contact._id) {
                console.error(
                  "Invalid contact for sender:",
                  senderId,
                  "target:",
                  targetId
                );
                socket.emit("error", { message: "Invalid contact" });
                return;
              }
              const ids = [
                contact.userId.toString(),
                contact.targetUserId?.toString(),
              ].sort();
              room = `chat_${ids[0]}_${ids[1]}`;
              savedMessage = await saveChatMessage({
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
            savedMessage = {
              _id: _id || new mongoose.Types.ObjectId(),
              ...message,
              timestamp,
            };
            if (!_id) {
              console.error(
                "Non-text message requires saved message _id:",
                message
              );
              socket.emit("error", {
                message: "Non-text message requires saved message _id",
              });
              return;
            } //check sending image vedio and files

            // Validate the saved message
            savedMessage = await findChatMessageById(_id);
            if (!savedMessage) {
              console.error("Invalid message ID for non-text message:", _id);
              socket.emit("error", { message: "Invalid message ID" });
              return;
            }
            if (type === "group") {
              room = `group_${targetId}`;
            } else {
              const contact = await findContactByUsers(senderId, targetId);
              const ids = [
                contact?.userId.toString(),
                contact?.targetUserId?.toString(),
              ].sort();
              room = `chat_${ids[0]}_${ids[1]}`;
            }
          }

          // Log sockets in room
          // const socketsInRoom = await io.in(room).allSockets();
          // const connectedUserIds = new Set<string>();
          // for (const socketId of socketsInRoom) {
          //   const s = io.sockets.sockets.get(socketId);
          //   if (s && s.data.userId) {
          //     connectedUserIds.add(s.data.userId);
          //   }
          // }
          // console.log(`Users in room ${room}:`, Array.from(connectedUserIds));

          // Create notifications for both text and non-text messages
          let recipientIds: string[] = [];
          let chatKey: string | null = null;

          if (savedMessage.groupId) {
            chatKey = `group_${savedMessage.groupId.toString()}`;
            const group = await Group.findById(savedMessage.groupId);
            if (group) {
              recipientIds = group.members
                .filter((member) => member.userId.toString() !== senderId)
                .map((member) => member.userId.toString());
            }
          } else if (savedMessage.collaborationId) {
            chatKey = `user-mentor_${savedMessage.collaborationId.toString()}`;
            const Collaboration = await collaboration.findById(
              savedMessage.collaborationId
            );
            if (Collaboration) {
              recipientIds = [
                Collaboration.userId.toString() === senderId
                  ? Collaboration.mentorId.toString()
                  : Collaboration.userId.toString(),
              ];
            }
          } else if (savedMessage.userConnectionId) {
            chatKey = `user-user_${savedMessage.userConnectionId.toString()}`;
            const connection = await userConnectionModal.findById(
              savedMessage.userConnectionId
            );
            if (connection) {
              recipientIds = [
                connection.requester.toString() === senderId
                  ? connection.recipient.toString()
                  : connection.requester.toString(),
              ];
            }
          }

          if (chatKey && recipientIds.length > 0) {
            // // Check which recipients are not in the room
            const socketsInRoom = await io.in(room).allSockets();
            const connectedUserIds = new Set<string>();
            for (const socketId of socketsInRoom) {
              const s = io.sockets.sockets.get(socketId);
              if (s && s.data.userId) {
                connectedUserIds.add(s.data.userId);
              }
            }

            for (const recipientId of recipientIds) {
              // if (activeChats.get(recipientId) === chatKey) {
              //   console.log(
              //     `Skipping message notification for user ${recipientId} (active in chat ${chatKey})`
              //   );
              //   continue;
              // }
              // if (
              //   !connectedUserIds.has(recipientId) ||
              //   activeChats.get(recipientId) !== chatKey
              // ) {
                try {
                  const notification = await sendNotification(
                    recipientId,
                    "message",
                    senderId,
                    chatKey,
                    contentType
                  );
                  // io.to(`user_${recipientId}`).emit(
                  //   "notification.new",
                  //   notification
                  // );
                  console.log(
                    `Emitted via notification emitter to user_${recipientId}:`,
                    notification
                  );
                } catch (error: any) {
                  console.warn(
                    `Failed to send notification to user ${recipientId}: ${error.message}`
                  );
                }
              // }
            }
          }

          if (!savedMessage) {
            console.error("Failed to save message:", message);
            socket.emit("error", { message: "Failed to save message" });
            return;
          }

          const messageData = {
            senderId,
            targetId,
            type,
            content,
            contentType,
            thumbnailUrl: savedMessage.thumbnailUrl,
            fileMetadata: savedMessage.fileMetadata,
            ...(type === "group" && { groupId: groupId || targetId }),
            ...(type === "user-mentor" && {
              collaborationId:
                collaborationId || savedMessage?.collaborationId?.toString(),
            }),
            ...(type === "user-user" && {
              userConnectionId:
                userConnectionId || savedMessage?.userConnectionId?.toString(),
            }),
            timestamp: timestampString,
            _id: savedMessage._id,
            status: savedMessage.status,
            isRead: savedMessage.isRead || false,
          };

          socket.broadcast.to(room).emit("receiveMessage", messageData);
          socket.emit("messageSaved", messageData);
          console.log(`Message broadcasted to room ${room}:`, messageData);
        } catch (error: any) {
          console.error("Error sending message:", error.message);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    socket.on(
      "typing",
      (data: {
        userId: string;
        targetId: string;
        type: "group" | "user-mentor" | "user-user";
        chatKey: string;
      }) => {
        const { userId, targetId, type, chatKey } = data;
        let room: string;
        if (type === "group") {
          room = `group_${targetId}`;
        } else {
          const ids = [userId, targetId].sort();
          room = `chat_${ids[0]}_${ids[1]}`;
        }
        socket.broadcast.to(room).emit("typing", { userId, chatKey });
      }
    );

    socket.on(
      "stopTyping",
      (data: {
        userId: string;
        targetId: string;
        type: "group" | "user-mentor" | "user-user";
        chatKey: string;
      }) => {
        const { userId, targetId, type, chatKey } = data;
        let room: string;
        if (type === "group") {
          room = `group_${targetId}`;
        } else {
          const ids = [userId, targetId].sort();
          room = `chat_${ids[0]}_${ids[1]}`;
        }
        console.log(
          `Broadcasting stopTyping to room ${room} (excluding sender ${socket.id}):`,
          { userId, chatKey }
        );
        socket.to(room).emit("stopTyping", { userId, chatKey });
      }
    );

    socket.on(
      "markAsRead",
      async (data: {
        chatKey: string;
        userId: string;
        type: "group" | "user-mentor" | "user-user";
      }) => {
        try {
          const { chatKey, userId, type } = data;
          //mark message as read
          const updatedMessages = await markMessagesAsRead(
            chatKey,
            userId,
            type
          );
          //mark notifications as read
          const notifications = await getNotifications(userId);
          const messageNotifications = notifications.filter(
            (n) =>
              n.type === "message" &&
              n.relatedId === chatKey &&
              n.status === "unread"
          );
          for (const notification of messageNotifications) {
            const updatedNotification = await markNotificationAsRead(
              notification._id
            );
            if (updatedNotification) {
              io.to(`user_${userId}`).emit("notification.read", {
                notificationId: notification._id,
              });
            }
          }
          let room: string;
          if (type === "group") {
            room = `group_${chatKey.replace("group_", "")}`;
          } else {
            const contact = await findContactByUsers(
              userId,
              chatKey.replace(/^(user-mentor_|user-user_)/, "")
            );
            const ids = [
              contact?.userId.toString(),
              contact?.targetUserId?.toString(),
            ].sort();
            room = `chat_${ids[0]}_${ids[1]}`;
          }
          io.to(room).emit("messagesRead", {
            chatKey,
            userId,
            messageIds: updatedMessages,
          });
        } catch (error: any) {
          console.error("Error marking messages as read:", error.message);
          socket.emit("error", { message: "Failed to mark messages as read" });
        }
      }
    );

    // WebRTC signaling handlers
    socket.on(
      "offer",
      async (data: {
        userId: string;
        targetId: string;
        type: string;
        chatKey: string;
        offer: RTCSessionDescriptionInit;
        callType: "audio" | "video";
      }) => {
        try {
          const { userId, targetId, type, chatKey, offer, callType } = data;
          console.log(
            `Received ${callType} offer from ${userId} for chatKey: ${chatKey}`
          );
          let room: string;
          let recipientIds: string[] = [];
          if (type === "group") {
            room = `group_${targetId}`;
            //get teh recipient Ids
            const group = await getGroupsByGroupId(targetId);
            if (!group) {
              console.error("Invalid group ID:", targetId);
              socket.emit("error", { message: "Invalid group ID" });
              return;
            }
            recipientIds = group.members
              .filter((member) => member.userId.toString() !== userId)
              .map((member) => member.userId.toString());
          } else {
            const contact = await findContactByUsers(userId, targetId);
            if (!contact) {
              console.error("Invalid contact for offer:", userId, targetId);
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
          const sender = await findUserById(userId);
          socket.broadcast
            .to(room)
            .emit("offer", {
              userId,
              targetId,
              type,
              chatKey,
              offer,
              callType,
              senderName: sender?.name,
            });
          // Create call notifications for recipients not in the room
          const callId = `${chatKey}_${Date.now()}`;
          const socketsInRoom = await io.in(room).allSockets();
          const connectedUserIds = new Set<string>();
          for (const socketId of socketsInRoom) {
            const s = io.sockets.sockets.get(socketId);
            if (s && s.data.userId) {
              connectedUserIds.add(s.data.userId);
            }
          }

          for (const recipientId of recipientIds) {
            // if (
            //   !connectedUserIds.has(recipientId) ||
            //   activeChats.get(recipientId) !== chatKey
            // ) {
              const notification = await sendNotification(
                recipientId,
                "incoming_call",
                userId,
                chatKey,
                callType,
                callId
              );
              // io.to(`user_${recipientId}`).emit(
              //   "notification.new",
              //   notification
              // );
              console.log(
                `Created call notification for user ${recipientId}, relying on notificationEmitter:`,
                notification
              );
            // }
          }

          // Track the offer for auto-end and missed call notification
          const endTimeout = setTimeout(async () => {
            const call = activeOffers.get(callId);
            if (!call) return;

            //send missed call notifications
            const socketsInRoom = await io.in(room).allSockets();
            const connectedUserIds = new Set<string>();
            for (const socketId of socketsInRoom) {
              const s = io.sockets.sockets.get(socketId);
              if (s && s.data.userId) {
                connectedUserIds.add(s.data.userId);
              }
            }

            for (const recipientId of recipientIds) {
              if (!connectedUserIds.has(recipientId)) {
                const notification = await updateCallNotificationToMissed(
                  recipientId,
                  callId,
                  `Missed ${callType} call from ${userId}`
                );
                if (notification) {
                  io.to(`user_${recipientId}`).emit(
                    "notification.updated",
                    notification
                  );
                } else {
                  console.log(
                    `No incoming call notification found for call ${callId}, creating new`
                  );
                  const newNotification = await sendNotification(
                    recipientId,
                    "missed_call",
                    userId,
                    chatKey,
                    callType,
                    callId
                  );
                  // io.to(`user_${recipientId}`).emit(
                  //   "notification.new",
                  //   newNotification
                  // );

                  console.log(
                    `Emitted notification.new to user_${recipientId}:`,
                    newNotification
                  );
                }
              }
            }

            socket
              .to(room)
              .emit("callEnded", { userId, targetId, type, chatKey, callType });
            socket.emit("callEnded", {
              userId,
              targetId,
              type,
              chatKey,
              callType,
            });
            activeOffers.delete(callId);
          }, 30000);

          activeOffers.set(callId, {
            senderId: userId,
            targetId,
            type,
            chatKey,
            callType,
            recipientIds,
            endTimeout,
          });
        } catch (error: any) {
          console.error("Error broadcasting offer:", error.message);
          socket.emit("error", { message: "Failed to send offer" });
        }
      }
    );

    socket.on(
      "answer",
      async (data: {
        userId: string;
        targetId: string;
        type: string;
        chatKey: string;
        answer: RTCSessionDescriptionInit;
        callType: "audio" | "video";
      }) => {
        try {
          const { userId, targetId, type, chatKey, answer, callType } = data;
          console.log(
            `Received ${callType} answer from ${userId} for chatKey: ${chatKey}`
          );
          let room: string;
          if (type === "group") {
            room = `group_${targetId}`;
          } else {
            const contact = await findContactByUsers(userId, targetId);
            if (!contact) {
              console.error("Invalid contact for answer:", userId, targetId);
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
            .emit("answer", {
              userId,
              targetId,
              type,
              chatKey,
              answer,
              callType,
            });

          // Clear timeout for this call
          const callId = Array.from(activeOffers.keys()).find(
            (id) =>
              activeOffers.get(id)?.chatKey === chatKey &&
              activeOffers.get(id)?.senderId === targetId
          );
          if (callId) {
            const call = activeOffers.get(callId);
            if (call) {
              clearTimeout(call.endTimeout);
              activeOffers.delete(callId);
            }
          }
        } catch (error: any) {
          console.error("Error broadcasting answer:", error.message);
          socket.emit("error", { message: "Failed to send answer" });
        }
      }
    );

    socket.on(
      "ice-candidate",
      async (data: {
        userId: string;
        targetId: string;
        type: string;
        chatKey: string;
        candidate: RTCIceCandidateInit;
        callType: "audio" | "video";
      }) => {
        try {
          const { userId, targetId, type, chatKey, candidate, callType } = data;
          console.log(
            `Received ${callType} ICE candidate from ${userId} for chatKey: ${chatKey}`
          );
          let room: string;
          if (type === "group") {
            room = `group_${targetId}`;
          } else {
            const contact = await findContactByUsers(userId, targetId);
            if (!contact) {
              console.error(
                "Invalid contact for ICE candidate:",
                userId,
                targetId
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
            .emit("ice-candidate", {
              userId,
              targetId,
              type,
              chatKey,
              candidate,
              callType,
            });
        } catch (error: any) {
          console.error("Error broadcasting ICE candidate:", error.message);
          socket.emit("error", { message: "Failed to send ICE candidate" });
        }
      }
    );

    socket.on(
      "callEnded",
      async (data: {
        userId: string;
        targetId: string;
        type: string;
        chatKey: string;
        callType: "audio" | "video";
      }) => {
        try {
          const { userId, targetId, type, chatKey, callType } = data;
          const callId = `${chatKey}_${Date.now()}`;
          if (endedCalls.has(callId)) {
            console.log(
              `Ignoring duplicate callEnded for callId: ${callId}, chatKey: ${chatKey}`
            );
            return;
          }
          console.log(
            `Received callEnded from ${userId} for chatKey: ${chatKey}, callType: ${callType}`
          );
          let room: string;

          if (type === "group") {
            room = `group_${targetId}`;
          } else {
            const contact = await findContactByUsers(userId, targetId);
            if (!contact) {
              console.error("Invalid contact for callEnded:", userId, targetId);
              socket.emit("error", { message: "Invalid contact" });
              return;
            }
            const ids = [
              contact.userId.toString(),
              contact.targetUserId?.toString(),
            ].sort();
            room = `chat_${ids[0]}_${ids[1]}`;
          }

          io.to(room).emit("callEnded", {
            userId,
            targetId,
            type,
            chatKey,
            callType,
          });
          endedCalls.add(callId);
          setTimeout(() => endedCalls.delete(callId), 60000); // Clear after 60s

          const callIdToClear = Array.from(activeOffers.keys()).find(
            (id) =>
              activeOffers.get(id)?.chatKey === chatKey &&
              activeOffers.get(id)?.senderId === userId
          );
          if (callIdToClear) {
            const call = activeOffers.get(callIdToClear);
            if (call) {
              clearTimeout(call.endTimeout);
              activeOffers.delete(callIdToClear);
            }
          }
        } catch (error: any) {
          console.error("Error handling callEnded:", error.message);
          socket.emit("error", { message: "Failed to end call" });
        }
      }
    );

    socket.on(
      "notification.read",
      async (data: { notificationId: string; userId: string }) => {
        try {
          const { notificationId, userId } = data;
          const notification = await markNotificationAsRead(notificationId);
          if (notification) {
            io.to(`user_${userId}`).emit("notification.read", {
              notificationId,
            });
          }
        } catch (error: any) {
          console.error("Error handling notification.read:", error.message);
          socket.emit("error", {
            message: "Failed to mark notification as read",
          });
        }
      }
    );

    socket.on("leaveChat", (userId: string) => {
  activeChats.delete(userId);
  console.log(`User ${userId} left active chat`);
});

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

//emit task notifications
const emitTaskNotification = (notification: TaskNotificationPayload) => {
  if (!io) {
    console.error("Socket.IO server not initialized");
    return;
  }
  if (sentNotifications.has(notification._id)) {
    console.log(`Skipping duplicate notification.new: ${notification._id}`);
    return;
  }
  console.log(
    `Received notification event for user ${notification.userId}:`,
    notification
  );
  const room = `user_${notification.userId}`;
  io.to(room).emit("notification.new", notification);
  sentNotifications.add(notification._id);
  console.log(
    `Emitted notification.new to user_${notification.userId}:`,
    notification
  );
  setTimeout(() => sentNotifications.delete(notification._id), 300 * 1000);
};

export default initializeSocket;
