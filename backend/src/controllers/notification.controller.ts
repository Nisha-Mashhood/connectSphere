import { Request, Response } from "express";
import * as notificationService from "../services/notification.service.js";

export const subscribeToNotifications = async (req:Request, res:Response) => {
  try {
    const { subscription, notificationDateTime, taskData } = req.body;
    const{ currentUserId } = req.params
    console.log("Task Id :",taskData);
    console.log("Subscription :",subscription);
    console.log("Notification Day and Time : ",notificationDateTime);
    console.log("Current User ID:", currentUserId);
    
    if (!taskData || !subscription) {
     res.status(400).json({ message: "Task data and subscription are required." });
     return 
  }
      // Validate subscription object
      if (!subscription.endpoint || !subscription.keys || !subscription.keys.auth || !subscription.keys.p256dh) {
        res.status(400).json({ message: "Invalid subscription format. Must include endpoint and keys (auth & p256dh)." });
        return;
      }
  const updatedTask = await notificationService.storeSubscription(currentUserId, taskData._id, subscription);
  res.status(200).json({ message: "Subscribed successfully.", task: updatedTask });
  return 
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};


//Socket.io notifications

  export const getNotifications = async(req: Request, res: Response) =>{
    const userId = req.query.userId as string;
    if (!userId) {
     res.status(400).json({ error: 'userId is required' });
     return 
    }
    const notifications = await notificationService.getNotifications(userId);
    res.json(notifications);
  }

  export const markAsRead = async(req: Request, res: Response) =>{
    const { notificationId } = req.params;
    const notification = await notificationService.markNotificationAsRead(notificationId);
    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return 
    }
    res.json(notification);
  }

  export const getUnreadCount = async(req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return 
    }
    const count = await notificationService.getUnreadCount(userId);
    res.json({ count });
  }
