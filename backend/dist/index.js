import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.config.js";
import config from "./config/env.config.js";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import subCategoryRoutes from "./routes/sucategory.routes.js";
import skillsRoutes from "./routes/skills.routes.js";
import userRoutes from "./routes/user.routes.js";
import mentorRoutes from "./routes/mentor.routes.js";
import collaborationRoutes from "./routes/collaboration.routes.js";
import groupRoutes from "./routes/group.routes.js";
import feedbackRoutes from './routes/feedback.routes.js';
import user_userCollabRoutes from './routes/userCollaboration.routes.js';
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
// Connect to DB
connectDB();
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subcategory", subCategoryRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/collaboration", collaborationRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/user-userCollab", user_userCollabRoutes);
// Placeholder route
app.get("/", (_req, res) => {
    res.send("Connect Sphere Backend is running!");
});
// Error Handling Middleware (for unhandled errors)
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).send({ error: "Something went wrong!" });
});
// Start server
app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
});
//# sourceMappingURL=index.js.map