import mongoose from "mongoose";
const taskSchema = new mongoose.Schema({
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
            ref: "Mentor",
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
// Automatically mark as "not-completed" if past due date
taskSchema.pre("save", function (next) {
    if (this.dueDate && new Date() > this.dueDate && this.status !== "completed") {
        this.status = "not-completed";
    }
    next();
});
export const Task = mongoose.model("Task", taskSchema);
//# sourceMappingURL=task.modal.js.map