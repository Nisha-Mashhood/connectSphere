import mongoose, { Document, Model } from "mongoose";
export interface ITask extends Document {
    _id: mongoose.Types.ObjectId;
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
    contextId: mongoose.Types.ObjectId;
    assignedUsers: mongoose.Types.ObjectId[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
}
export declare const Task: Model<ITask>;
//# sourceMappingURL=task.modal.d.ts.map