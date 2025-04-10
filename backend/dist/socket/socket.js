import { findContactByUsers, findContactsByUserId } from "../repositories/contacts.repository.js";
import { getGroupsByGroupId, isUserInGroup } from "../repositories/group.repositry.js";
import { saveChatMessage } from "../repositories/chat.repository.js";
import mongoose from "mongoose";
const initializeSocket = (io) => {
    console.log("Socket.IO server initialized");
    io.on("connection", (socket) => {
        socket.on("joinChats", async (userId) => {
            try {
                const contacts = await findContactsByUserId(userId);
                const rooms = Array.from(new Set(contacts.map((contact) => {
                    if (contact.type === "group" && contact.groupId) {
                        return `group_${contact.groupId._id.toString()}`;
                    }
                    else if (contact.userId && contact.targetUserId) {
                        const ids = [contact.userId._id.toString(), contact.targetUserId._id.toString()].sort();
                        return `chat_${ids[0]}_${ids[1]}`;
                    }
                    return null;
                }).filter(Boolean)));
                socket.join(rooms);
                console.log(`User ${userId} joined rooms:`, rooms);
            }
            catch (error) {
                console.error(`Error joining chats for user ${userId}:`, error.message);
            }
        });
        socket.on("sendMessage", async (message) => {
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
                let room;
                let savedMessage;
                const senderObjectId = new mongoose.Types.ObjectId(senderId);
                const validContentType = contentType === "image" || contentType === "file" ? contentType : "text";
                if (type === "group") {
                    const group = await getGroupsByGroupId(targetId);
                    console.log("Group fetched:", group);
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
                    if (validContentType === "text") { // Save only text messages
                        savedMessage = await saveChatMessage({
                            senderId: senderObjectId,
                            groupId: new mongoose.Types.ObjectId(groupId || targetId),
                            content,
                            contentType: validContentType,
                            timestamp,
                        });
                    }
                    else {
                        savedMessage = { _id: _id || new mongoose.Types.ObjectId(), ...message, timestamp }; // Use existing _id for media
                    }
                }
                else {
                    const contact = await findContactByUsers(senderId, targetId);
                    console.log("Contact fetched:", contact);
                    if (!contact || !contact._id) {
                        console.error("Invalid contact for sender:", senderId, "target:", targetId);
                        socket.emit("error", { message: "Invalid contact" });
                        return;
                    }
                    const ids = [contact.userId.toString(), contact.targetUserId?.toString()].sort();
                    room = `chat_${ids[0]}_${ids[1]}`;
                    if (validContentType === "text") { // Save only text messages
                        savedMessage = await saveChatMessage({
                            senderId: senderObjectId,
                            ...(type === "user-mentor" && { collaborationId: new mongoose.Types.ObjectId(collaborationId || contact.collaborationId?.toString()) }),
                            ...(type === "user-user" && { userConnectionId: new mongoose.Types.ObjectId(userConnectionId || contact.userConnectionId?.toString()) }),
                            content,
                            contentType: validContentType,
                            timestamp,
                        });
                    }
                    else {
                        savedMessage = { _id: _id || new mongoose.Types.ObjectId(), ...message, timestamp }; // Use existing _id for media
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
                    contentType: validContentType,
                    ...(type === "group" && { groupId: groupId || targetId }),
                    ...(type === "user-mentor" && { collaborationId: collaborationId || savedMessage?.collaborationId?.toString() }),
                    ...(type === "user-user" && { userConnectionId: userConnectionId || savedMessage?.userConnectionId?.toString() }),
                    timestamp: timestampString,
                    _id: savedMessage?._id,
                };
                socket.broadcast.to(room).emit("receiveMessage", messageData);
                socket.emit("messageSaved", messageData);
                console.log(`Message broadcasted to room ${room}:`, messageData);
            }
            catch (error) {
                console.error("Error sending message:", error.message);
                socket.emit("error", { message: "Failed to send message" });
            }
        });
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};
export default initializeSocket;
//# sourceMappingURL=socket.js.map