import { Server, Socket } from "socket.io";
import { findContactByUsers, findContactsByUserId } from "../repositories/contacts.repository.js";
import { getGroupsByGroupId, isUserInGroup } from "../repositories/group.repositry.js";
import { markMessagesAsRead, saveChatMessage } from "../repositories/chat.repository.js";
import mongoose from "mongoose";

const initializeSocket = (io: Server) => {
  console.log("Socket.IO server initialized");
  io.on("connection", (socket: Socket) => {
    socket.on("joinChats", async (userId: string) => {
      try {
        const contacts = await findContactsByUserId(userId);
        const rooms = Array.from(
          new Set(
            contacts.map((contact) => {
              if (contact.type === "group" && contact.groupId) {
                return `group_${contact.groupId._id.toString()}`;
              } else if (contact.userId && contact.targetUserId) {
                const ids = [contact.userId._id.toString(), contact.targetUserId._id.toString()].sort();
                return `chat_${ids[0]}_${ids[1]}`;
              }
              return null;
            }).filter(Boolean)
          )
        ) as string[];

        socket.join(rooms);
        console.log(`User ${userId} joined rooms:`, rooms);
      } catch (error: any) {
        console.error(`Error joining chats for user ${userId}:`, error.message);
      }
    });

    socket.on("sendMessage", async (message: {
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
        const { senderId, targetId, type, content, contentType = "text", collaborationId, userConnectionId, groupId, _id } = message;

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

        if (contentType === "text") { // Only save text messages 
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
            });
          } else {
            const contact = await findContactByUsers(senderId, targetId);
            if (!contact || !contact._id) {
              console.error("Invalid contact for sender:", senderId, "target:", targetId);
              socket.emit("error", { message: "Invalid contact" });
              return;
            }
            const ids = [contact.userId.toString(), contact.targetUserId?.toString()].sort();
            room = `chat_${ids[0]}_${ids[1]}`;
            savedMessage = await saveChatMessage({
              senderId: senderObjectId,
              ...(type === "user-mentor" && { collaborationId: new mongoose.Types.ObjectId(collaborationId || contact.collaborationId?.toString()) }),
              ...(type === "user-user" && { userConnectionId: new mongoose.Types.ObjectId(userConnectionId || contact.userConnectionId?.toString()) }),
              content,
              contentType,
              timestamp,
            });
          }
        } else {
          // For media, use the existing message from upload
          savedMessage = { _id: _id || new mongoose.Types.ObjectId(), ...message, timestamp };
          if (type === "group") {
            room = `group_${targetId}`;
          } else {
            const contact = await findContactByUsers(senderId, targetId);
            const ids = [contact?.userId.toString(), contact?.targetUserId?.toString()].sort();
            room = `chat_${ids[0]}_${ids[1]}`;
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
          ...(type === "user-mentor" && { collaborationId: collaborationId || savedMessage?.collaborationId?.toString() }),
          ...(type === "user-user" && { userConnectionId: userConnectionId || savedMessage?.userConnectionId?.toString() }),
          timestamp: timestampString,
          _id: savedMessage._id,
        };

        socket.broadcast.to(room).emit("receiveMessage", messageData);
        socket.emit("messageSaved", messageData);
        console.log(`Message broadcasted to room ${room}:`, messageData);
      } catch (error: any) {
        console.error("Error sending message:", error.message);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("typing", (data: { userId: string; targetId: string; type: "group" | "user-mentor" | "user-user"; chatKey: string }) => {
      const { userId, targetId, type, chatKey } = data;
      let room: string;
      if (type === "group") {
        room = `group_${targetId}`;
      } else {
        const ids = [userId, targetId].sort();
        room = `chat_${ids[0]}_${ids[1]}`;
      }
      socket.broadcast.to(room).emit("typing", { userId, chatKey });
    });

    socket.on("stopTyping", (data: { userId: string; targetId: string; type: "group" | "user-mentor" | "user-user"; chatKey: string }) => {
      const { userId, targetId, type, chatKey } = data;
      let room: string;
      if (type === "group") {
        room = `group_${targetId}`;
      } else {
        const ids = [userId, targetId].sort();
        room = `chat_${ids[0]}_${ids[1]}`;
      }
      socket.broadcast.to(room).emit("stopTyping", { userId, chatKey });
    });

    socket.on("markAsRead", async (data: { chatKey: string; userId: string; type: "group" | "user-mentor" | "user-user" }) => {
      try {
        const { chatKey, userId, type } = data;
        await markMessagesAsRead(chatKey, userId, type);
        let room: string;
        if (type === "group") {
          room = `group_${chatKey.replace("group_", "")}`;
        } else {
          const contact = await findContactByUsers(userId, chatKey.replace(/^(user-mentor_|user-user_)/, ""));
          const ids = [contact?.userId.toString(), contact?.targetUserId?.toString()].sort();
          room = `chat_${ids[0]}_${ids[1]}`;
        }
        io.to(room).emit("messagesRead", { chatKey, userId });
      } catch (error: any) {
        console.error("Error marking messages as read:", error.message);
        socket.emit("error", { message: "Failed to mark messages as read" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export default initializeSocket;