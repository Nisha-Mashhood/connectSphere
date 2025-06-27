import express from "express";
import AdminController from "../Controllers/AdminDashboardController";
import { apiLimiter } from "../../../middlewares/ratelimit.middleware";
import { AuthMiddleware } from '../../../middlewares/auth.middleware';
import { ADMIN_DASHBOARD_ROUTES } from "../Constant/AdminDashboard.routes";

const router = express.Router();
const authMiddleware = new AuthMiddleware();


router.get(ADMIN_DASHBOARD_ROUTES.GetTotalUsers, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getTotalUsersCount);
router.get(ADMIN_DASHBOARD_ROUTES.GetTotalMentors, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getTotalMentorsCount);
router.get(ADMIN_DASHBOARD_ROUTES.GetTotalRevenue, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getTotalRevenue);
router.get(ADMIN_DASHBOARD_ROUTES.GetPendingMentorRequestsCount, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getPendingMentorRequestsCount);
router.get(ADMIN_DASHBOARD_ROUTES.GetActiveCollaborationsCount, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getActiveCollaborationsCount);
router.get(ADMIN_DASHBOARD_ROUTES.GetRevenueTrends, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getRevenueTrends);
router.get(ADMIN_DASHBOARD_ROUTES.GetUserGrowth, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getUserGrowth);
router.get(ADMIN_DASHBOARD_ROUTES.GetPendingMentorRequests, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getPendingMentorRequests);
router.get(ADMIN_DASHBOARD_ROUTES.GetTopMentors, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getTopMentors);
router.get(ADMIN_DASHBOARD_ROUTES.GetRecentCollaborations, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], AdminController.getRecentCollaborations);

export default router;
