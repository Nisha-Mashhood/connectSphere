import{ Task }from "../models/task.modal.js";
import{ PushSubscription } from "../services/notification.service.js";

//Save subscription to a task
export const saveSubscription = async (taskId:string, subscription:PushSubscription) => {
  return await Task.findByIdAndUpdate(taskId, { notificationSubscription: subscription }, { new: true });
};

//Get tasks that need notifications
export const getTasksForNotification = async () => {
  const now = new Date();
  return await Task.find({
      status: { $ne: "completed" },// Task should not be completed
      dueDate: { $gte: now }, // Due date is not passed
      notificationDate: { $lte: now }, // Fetch tasks where notification date has arrived
      notificationSubscription: { $ne: null },  // Has subscription
  });
};