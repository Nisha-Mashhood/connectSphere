import "reflect-metadata";
import express from "express";
import connectDB from "./config/db.config";
import config from "./config/env.config";
import authRoutes from "./Routes/Routes/Auth.routes";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { CleanupScheduler } from "./core/Utils/NotificationSchdduler";
import logger from "./core/Utils/logger";
import categoryRoutes from "./Routes/Routes/Category.routes";
import subCategoryRoutes from "./Routes/Routes/SubCategory.routes";
import skillsRoutes from "./Routes/Routes/Skills.routes";
import mentorRoutes from "./Routes/Routes/Mentor.routes";
import collaborationRoutes from "./Routes/Routes/Collaboration.routes";
import groupRoutes from "./Routes/Routes/Group.routes";
import feedbackRoutes from './Routes/Routes/FeedBack.routes';
import user_userCollabRoutes from './Routes/Routes/UserCollaboration.routes';
import taskRoutes from './Routes/Routes/Task.routes';
import  notificationRoutes from './Routes/Routes/Notification.routes';
import adminRoutes from './Routes/Routes/AdminDashboard.routes';
import chatRoutes from "./Routes/Routes/Chat.routes";
import contactsRoutes from "./Routes/Routes/Contact.routes";
import reviewsRoutes from "./Routes/Routes/Review.routes";
import contactUsRoutes from "./Routes/Routes/ContactUs.routes";
import callLogRoutes from "./Routes/Routes/Call.routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import container from "./container";
import { ISocketService } from "./Interfaces/Services/ISocketService";

const app = express();
const server: http.Server = http.createServer(app);

// Connect to DB and run cleanup
const startServer = async () => {
  await connectDB(); 


  // Middleware
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({
    origin: config.frontendurl || "http://localhost:5173",
    credentials: true,
  }));


  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/category", categoryRoutes);
  app.use("/api/subcategory", subCategoryRoutes);
  app.use("/api/skills", skillsRoutes);
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
  app.use("/api/callLog",callLogRoutes);

  // Placeholder route
  app.get("/", (_req, res) => {
    res.send("Connect Sphere Backend is running!");
  });

    app.use(errorHandler);


  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: config.frontendurl || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  const socketService =container.get<ISocketService>('ISocketService');
  socketService.initialize(io);

  // Schedule Node cron tasks
  const cleanupScheduler = new CleanupScheduler();
  cleanupScheduler.start();

  // Start server
  server.listen(config.port, () => {
    logger.info(`Server is running on http://localhost:${config.port}`);
  });
};

// Start the server
startServer();
