import { CollabData, Group, User } from "../../redux/types";

export interface Task {
  id: string;
  taskId: string;
  name: string;
  description?: string;
  image?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed" | "not-completed";
  startDate: string;
  dueDate: string;
  notificationDate?: string;
  notificationTime?: string;
  contextType: "user" | "group" | "collaboration";
  contextId: string;
  context?: User | Group | CollabData;
  createdBy: string;
  createdByDetails?: User;
  assignedUsers: string[];
  assignedUsersDetails?: User[];
  createdAt: string;
}
