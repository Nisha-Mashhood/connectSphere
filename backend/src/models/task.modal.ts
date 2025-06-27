import mongoose, { Schema, Model } from "mongoose";
import { generateCustomId } from "../core/Utils/IdGenerator";
import { ITask } from "../Interfaces/models/ITask";
import logger from "../core/Utils/Logger";

const taskSchema: Schema<ITask> = new mongoose.Schema({
  taskId: {
    type: String,
    unique: true,
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

taskSchema.pre("save", async function (next) {
  try {
    // Generate taskId if not set
    if (!this.taskId) {
      this.taskId = await generateCustomId("task", "TSK");
      logger.debug(`Generated taskId: ${this.taskId} for task: ${this.name}`);
    }

    // Update status if past due date
    if (
      this.dueDate &&
      new Date() > this.dueDate &&
      this.status !== "completed"
    ) {
      this.status = "not-completed";
      logger.debug(
        `Updated status to not-completed for task: ${this.taskId} due to past due date: ${this.dueDate}`
      );
    }
    next();
  } catch (error) {
    logger.error(
      `Error in pre-save hook for task: ${this.name || "unnamed"}: ${error}`
    );
    next(error as Error);
  }
});

export const Task: Model<ITask> = mongoose.model<ITask>("Task", taskSchema);
