import express from "express";
import AdminController from "../../controllers/Admin/adminDashboard.controller.js";
import { apiLimiter } from "../../middlewares/ratelimit.middleware.js";
import { authorize, verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/total-users", [apiLimiter, verifyToken, authorize('admin')], AdminController.getTotalUsersCount);
router.get("/total-mentors", [apiLimiter, verifyToken, authorize('admin')], AdminController.getTotalMentorsCount);
router.get("/total-revenue", [apiLimiter, verifyToken, authorize('admin')], AdminController.getTotalRevenue);
router.get("/pending-mentor-requests/count", [apiLimiter, verifyToken, authorize('admin')], AdminController.getPendingMentorRequestsCount);
router.get("/active-collaborations/count", [apiLimiter, verifyToken, authorize('admin')], AdminController.getActiveCollaborationsCount);
router.get("/revenue-trends", [apiLimiter, verifyToken, authorize('admin')], AdminController.getRevenueTrends);
router.get("/user-growth", [apiLimiter, verifyToken, authorize('admin')], AdminController.getUserGrowth);
router.get("/pending-mentor-requests", [apiLimiter, verifyToken, authorize('admin')], AdminController.getPendingMentorRequests);
router.get("/top-mentors", [apiLimiter, verifyToken, authorize('admin')], AdminController.getTopMentors);
router.get("/recent-collaborations", [apiLimiter, verifyToken, authorize('admin')], AdminController.getRecentCollaborations);

export default router;
