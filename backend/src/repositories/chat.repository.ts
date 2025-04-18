import ChatMessage, { IChatMessage } from "../models/chat.model.js";
import mongoose from "mongoose";

const toObjectId = (id?: string): mongoose.Types.ObjectId | undefined => {
  return id ? new mongoose.Types.ObjectId(id) : undefined;
};

export const saveChatMessage = async (messageData: Partial<IChatMessage>): Promise<IChatMessage> => {
  try {

    const message = new ChatMessage({
      ...messageData,
      senderId: messageData.senderId,
      collaborationId: messageData.collaborationId,
      userConnectionId: messageData.userConnectionId,
      groupId: messageData.groupId,
    });
    return await message.save();
  } catch (error: any) {
    throw new Error(`Error saving chat message: ${error.message}`);
  }
};

export const findChatMessagesByCollaborationId = async (collaborationId: string, page: number, limit: number) => {
  try {
    return await ChatMessage.find({ collaborationId: toObjectId(collaborationId) })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  } catch (error: any) {
    throw new Error(`Error finding chat messages by collaboration ID: ${error.message}`);
  }
};

export const findChatMessagesByUserConnectionId = async (userConnectionId: string, page: number, limit: number) => {
  try {
    return await ChatMessage.find({ userConnectionId: toObjectId(userConnectionId) })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  } catch (error: any) {
    throw new Error(`Error finding chat messages by user connection ID: ${error.message}`);
  }
};

export const findChatMessagesByGroupId = async (groupId: string, page: number, limit: number) => {
  try {
    return await ChatMessage.find({ groupId: toObjectId(groupId) })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  } catch (error: any) {
    throw new Error(`Error finding chat messages by group ID: ${error.message}`);
  }
};

export const countMessagesByCollaborationId = async (collaborationId: string): Promise<number> => {
  return await ChatMessage.countDocuments({ collaborationId: toObjectId(collaborationId) });
};

export const countMessagesByUserConnectionId = async (userConnectionId: string): Promise<number> => {
  return await ChatMessage.countDocuments({ userConnectionId: toObjectId(userConnectionId) });
};

export const countMessagesByGroupId = async (groupId: string): Promise<number> => {
  return await ChatMessage.countDocuments({ groupId: toObjectId(groupId) });
};

export const countUnreadMessagesByCollaborationId = async(collaborationId:string , userId:string) =>{
  return await ChatMessage.countDocuments({
    collaborationId: toObjectId(collaborationId),
    isRead: false,
    senderId: { $ne: toObjectId(userId) },
  });
}

export const countUnreadMessagesByUserConnectionId = async(userConnectionId:string , userId:string) =>{
  return await ChatMessage.countDocuments({
    userConnectionId: toObjectId(userConnectionId),
    isRead: false,
    senderId: { $ne: toObjectId(userId) },
  });
}

export const countUnreadMessagesByGroupId = async(groupId:string , userId:string) =>{
  return await ChatMessage.countDocuments({
    groupId: toObjectId(groupId),
    isRead: false,
    senderId: { $ne: toObjectId(userId) },
  });
}

export const markMessagesAsRead = async (
  chatKey: string,
  userId: string,
  type: "group" | "user-mentor" | "user-user"
): Promise<void> => {
  const filter: any = { isRead: false, senderId: { $ne: toObjectId(userId) } };
  if (type === "group") {
    filter.groupId = toObjectId(chatKey.replace("group_", ""));
  } else if (type === "user-mentor") {
    filter.collaborationId = toObjectId(chatKey.replace("user-mentor_", ""));
  } else {
    filter.userConnectionId = toObjectId(chatKey.replace("user-user_", ""));
  }

  await ChatMessage.updateMany(filter, { $set: { isRead: true, status: "read" } });
};