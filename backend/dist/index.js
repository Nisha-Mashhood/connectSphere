import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.config.js";
import config from "./config/env.config.js";
import authRoutes from "./Modules/Auth/Routes/AuthRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { SocketService } from "./socket/SocketService.js";
import { CleanupScheduler } from "./core/Utils/NotificationSchdduler.js";
import logger from "./core/Utils/Logger.js";
import categoryRoutes from "./Modules/Category/Routes/CategoryRoutes.js";
import subCategoryRoutes from "./Modules/Subcategory/Routes/SubCategoryRoutes.js";
import skillsRoutes from "./Modules/Skills/Routes/SkillsRoutes.js";
// import userRoutes from "./routes/user.routes.js";//Check this
import mentorRoutes from "./Modules/Mentor/Routes/MentorRoutes.js";
import collaborationRoutes from "./Modules/Collaboration/Routes/CollaborationRoutes.js";
import groupRoutes from "./Modules/Group/Routes/GroupRoutes.js";
import feedbackRoutes from './Modules/Feedback/Routes/FeedBackRoutes.js';
import user_userCollabRoutes from './Modules/UserCollaboration/Routes/UserCollaborationroutes.js';
import taskRoutes from './Modules/Task/Routes/TaskRoutes.js';
import notificationRoutes from './Modules/Notification/Routes/Notificationroutes.js';
import adminRoutes from './Modules/AdminDashboard/Routes/AdminDashboardRoutes.js';
import chatRoutes from "./Modules/Chat/Routes/ChatRoutes.js";
import contactsRoutes from "./Modules/Contact/Routes/ContactRoutes.js";
import reviewsRoutes from "./Modules/Review/Routes/ReviewRoutes.js";
import contactUsRoutes from "./Modules/ContactUs/Routes/ContactUsRoutes.js";
dotenv.config();
const app = express();
const server = http.createServer(app);
// Connect to DB
connectDB();
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subcategory", subCategoryRoutes);
app.use("/api/skills", skillsRoutes);
// app.use("/api/users", userRoutes);//check this
app.use("/api/mentors", mentorRoutes);
app.use("/api/collaboration", collaborationRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/user-userCollab", user_userCollabRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/contactUs", contactUsRoutes);
// Placeholder route
app.get("/", (_req, res) => {
    res.send("Connect Sphere Backend is running!");
});
// Error Handling Middleware (for unhandled errors)
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).send({ error: "Something went wrong!" });
});
// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
const socketService = new SocketService(); // Instantiate SocketService
socketService.initialize(io); // Call initialize method
//Schedule Node_corn
const cleanupScheduler = new CleanupScheduler();
cleanupScheduler.start();
// Start server
server.listen(config.port, () => {
    logger.info(`Server is running on http://localhost:${config.port}`);
});
//# sourceMappingURL=index.js.map