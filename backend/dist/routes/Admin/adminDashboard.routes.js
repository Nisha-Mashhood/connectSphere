import express from "express";
import AdminController from "../../controllers/Admin/adminDashboard.controller.js";
import { apiLimiter } from "../../middlewares/ratelimit.middleware.js";
import { AuthMiddleware } from '../../middlewares/auth.middleware.js';
const router = express.Router();
const authMiddleware = new AuthMiddleware();
router.get("/total-users", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getTotalUsersCount);
router.get("/total-mentors", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getTotalMentorsCount);
router.get("/total-revenue", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getTotalRevenue);
router.get("/pending-mentor-requests/count", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getPendingMentorRequestsCount);
router.get("/active-collaborations/count", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getActiveCollaborationsCount);
router.get("/revenue-trends", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getRevenueTrends);
router.get("/user-growth", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getUserGrowth);
router.get("/pending-mentor-requests", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getPendingMentorRequests);
router.get("/top-mentors", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getTopMentors);
router.get("/recent-collaborations", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getRecentCollaborations);
export default router;
//# sourceMappingURL=adminDashboard.routes.js.map