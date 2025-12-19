import "reflect-metadata";
import express from "express";
import connectDB from "./config/db-config";
import config from "./config/env-config";
import authRoutes from "./Routes/Routes/auth-routes";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { CleanupScheduler } from "./core/utils/notification-scheduler";
import logger from "./core/utils/logger";
import categoryRoutes from "./Routes/Routes/category-routes";
import subCategoryRoutes from "./Routes/Routes/sub-category-routes";
import skillsRoutes from "./Routes/Routes/skills-routes";
import mentorRoutes from "./Routes/Routes/mentor-routes";
import collaborationRoutes from "./Routes/Routes/collaboration-routes";
import groupRoutes from "./Routes/Routes/group-routes";
import feedbackRoutes from './Routes/Routes/feedback-routes';
import user_userCollabRoutes from './Routes/Routes/user-collaboration-routes';
import taskRoutes from './Routes/Routes/task-routes';
import  notificationRoutes from './Routes/Routes/notification-routes';
import adminRoutes from './Routes/Routes/admin-dashboard-routes';
import chatRoutes from "./Routes/Routes/chat-routes";
import contactsRoutes from "./Routes/Routes/contact-routes";
import reviewsRoutes from "./Routes/Routes/review-routes";
import contactUsRoutes from "./Routes/Routes/contact-us-routes";
import callLogRoutes from "./Routes/Routes/call-routes";
import { errorHandler } from "./middlewares/error-handler-middleware";
import container from "./container";
import { ISocketService } from "./Interfaces/Services/i-socket-service";

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
