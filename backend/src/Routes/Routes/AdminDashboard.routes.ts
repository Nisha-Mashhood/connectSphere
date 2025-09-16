import express from "express";
import { AdminController } from "../../Controllers/AdminDashboard.controller";
import { apiLimiter } from "../../middlewares/ratelimit.middleware";
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { ADMIN_DASHBOARD_ROUTES } from "../Constants/AdminDashboard.routes";

const router = express.Router();
const authMiddleware = new AuthMiddleware();
const adminController = new AdminController();


router.get(ADMIN_DASHBOARD_ROUTES.GetTotalUsers, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getTotalUsersCount);
router.get(ADMIN_DASHBOARD_ROUTES.GetTotalMentors, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getTotalMentorsCount);
router.get(ADMIN_DASHBOARD_ROUTES.GetTotalRevenue, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getTotalRevenue);
router.get(ADMIN_DASHBOARD_ROUTES.GetPendingMentorRequestsCount, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getPendingMentorRequestsCount);
router.get(ADMIN_DASHBOARD_ROUTES.GetActiveCollaborationsCount, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getActiveCollaborationsCount);
router.get(ADMIN_DASHBOARD_ROUTES.GetRevenueTrends, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getRevenueTrends);
router.get(ADMIN_DASHBOARD_ROUTES.GetUserGrowth, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getUserGrowth);
router.get(ADMIN_DASHBOARD_ROUTES.GetPendingMentorRequests, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getPendingMentorRequests);
router.get(ADMIN_DASHBOARD_ROUTES.GetTopMentors, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getTopMentors);
router.get(ADMIN_DASHBOARD_ROUTES.GetRecentCollaborations, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getRecentCollaborations);

export default router;
