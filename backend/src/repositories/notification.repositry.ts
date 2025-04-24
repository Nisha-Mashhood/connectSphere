import{ Task }from "../models/task.modal.js";
import{ PushSubscription } from "../services/notification.service.js";
import collaboration from "../models/collaboration.js";
import Group from "../models/group.model.js";
import { IMentor } from "../models/mentor.model.js";
import { ObjectId } from "mongoose";
import { AppNotification, AppNotificationModel } from "../models/notification.modal.js";

interface CollaborationData {
  userId: ObjectId;
  mentorId: IMentor;
}

interface UserIds {
  userId: string;
  mentorUserId: string | null;
}


//Save subscription to a task
export const saveSubscription = async (taskId:string, subscription:PushSubscription, metadata?: { userId?: string }) => {
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    
    // Create a new object that combines subscription and userId
    const subscriptionWithUserId = {
      ...subscription,
      userId: metadata?.userId
    };

    task.notificationSubscription = subscriptionWithUserId;

    await task.save();
    return task;
  } catch (error) {
    console.error("Error saving subscription:", error);
    throw error;
  }
};

//Get task details for notifications
export const getTasksForNotification = async (taskId: string) => {
  const now = new Date();
  return await Task.findOne({ 
    _id: taskId,
    status: { $ne: "completed" }, // Task should not be completed
    dueDate: { $gte: now }, // Due date is not passed
    notificationDate: { $lte: now }, // Notification date has arrived
    notificationSubscription: { $ne: null }, // Has subscription
  });
};

//Get tasks that need notifications
export const getAllTasksForNotification = async () => {
  const now = new Date();
  return await Task.find({ 
    status: { $ne: "completed" }, // Task should not be completed
    dueDate: { $gte: now }, // Due date is not passed
    notificationDate: { $lte: now }, // Notification date has arrived
    notificationSubscription: { $ne: null }, // Has subscription
  });
};

export const getGroupMembers = async (groupId:string) => {
  const group = await Group.findById(groupId);
  return group ? group.members : [];
};


export const getMentorIdAndUserId = async (collaborationId: string): Promise<UserIds | null> => {
  const collaborationData = await collaboration
    .findById(collaborationId)
    .populate<{ mentorId: IMentor }>({ 
      path: "mentorId", 
      select: "userId" 
    })
    .select("userId mentorId") as CollaborationData | null;

  if (!collaborationData) return null;

  return { 
    userId: collaborationData.userId.toString(), 
    mentorUserId: collaborationData.mentorId?.userId?.toString() || null 
  };
};

export const getUserSubscription = async (userId:string) => {
  return await Task.findOne({ "notificationSubscription.userId": userId });
};




//Notification with socket.io

  export const createNotification = async (notification: Omit<AppNotification, '_id'>): Promise<AppNotification> => {
    return AppNotificationModel.create(notification);
  }

  export const findNotificationByUserId = async(userId: string): Promise<AppNotification[]> => {
    return AppNotificationModel.find({ userId, status: 'unread' })
      .sort({ createdAt: -1 })
      .limit(50);
  }

  export const findNotificationByCallId = async (userId: string, callId: string) => {
    return AppNotificationModel.findOne({ userId, callId, type: "incoming_call", status: "unread" });
  };
  
  export const updateNotificationToMissed = async (userId: string, callId: string, content: string) => {
    return AppNotificationModel.findOneAndUpdate(
      { userId, callId, type: "incoming_call", status: "unread" },
      { type: "missed_call", content, updatedAt: new Date() },
      { new: true }
    );
  };

  export const markNotificationAsRead = async (notificationId: string): Promise<AppNotification | null> =>{
    return AppNotificationModel.findByIdAndUpdate(
      notificationId,
      { status: 'read', updatedAt: new Date() },
      { new: true }
    );
  }

  export const getNotificationUnreadCount = async(userId: string): Promise<number> =>{
    return AppNotificationModel.countDocuments({ userId, status: 'unread' });
  }
