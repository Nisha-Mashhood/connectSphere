export interface ITaskDTO {
  id: string;
  taskId: string;
  name: string;
  description?: string;
  image?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed" | "not-completed";
  startDate: Date;
  dueDate: Date;
  notificationDate?: Date;
  notificationTime?: string;
  contextType: "profile" | "group" | "collaboration";
  contextId: string;
  assignedUsers: string[];
  createdBy: string;
  createdAt: Date;
}
