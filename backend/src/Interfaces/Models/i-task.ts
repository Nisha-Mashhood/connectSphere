import  { Document, Types } from "mongoose";

export interface ITask extends Document {
    _id: Types.ObjectId;
    taskId:string;
    name: string;
    description?: string;
    image?: string;
    priority: "low" | "medium" | "high";
    status: "pending" | "in-progress" | "completed" | "not-completed";
    startDate: Date;
    dueDate: Date;
    notificationDate?: Date;
    notificationTime?: string;
    contextType: "user" | "group" | "collaboration";
    contextId: Types.ObjectId;
    assignedUsers: Types.ObjectId[];
    createdBy: Types.ObjectId;
    createdAt: Date;
  }


