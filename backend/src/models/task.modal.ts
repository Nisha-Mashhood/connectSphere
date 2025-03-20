import mongoose, { Schema, Document, Model } from "mongoose";
import { generateCustomId } from '../utils/idGenerator.utils.js';

export interface ITask extends Document {
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
    notificationSubscription?: {
      endpoint: string;
      keys: {
        auth: string;
        p256dh: string;
      };
      userId?: string;
    };
    privacy: "private" | "public";
    contextType: "profile" | "group" | "collaboration";
    contextId: mongoose.Types.ObjectId;
    assignedUsers: mongoose.Types.ObjectId[];
    assignedCollaborations: mongoose.Types.ObjectId[];
    assignedGroups: mongoose.Types.ObjectId[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
  }

const taskSchema: Schema<ITask> = new mongoose.Schema({
  taskId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "not-completed"],
    default: "pending",
  },
  startDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  notificationDate: {
    type: Date,
  },
  notificationTime: {
    type: String,
  },
  notificationSubscription: {
    type: {
      endpoint: String,
      keys: {
        auth: String,
        p256dh: String
      },
      userId: String
    },
    default: null 
  },
  privacy: {
    type: String,
    enum: ["private", "public"],
    default: "private",
  },
  // Contextual fields
  contextType: {
    type: String,
    enum: ["profile", "group", "collaboration"],
    required: true,
  },
  contextId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "contextType",
  },
  // Connections for public tasks
  assignedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  assignedCollaborations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collaboration",
    },
  ],
  assignedGroups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});


taskSchema.pre("save", async function(next) {
  // Generate taskId if not set
  if (!this.taskId) {
    this.taskId = await generateCustomId("task", "TSK");
  }

  // Update status if past due date
  // Automatically mark as "not-completed" if past due date
  if (this.dueDate && new Date() > this.dueDate && this.status !== "completed") {
    this.status = "not-completed";
  }

  next();
});

export const Task: Model<ITask> = mongoose.model<ITask>("Task", taskSchema);
