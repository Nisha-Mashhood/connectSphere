import express from "express";
import container from "../../container";
import { ADMIN_DASHBOARD_ROUTES } from "../Constants/AdminDashboard.routes";
import { apiLimiter } from "../../middlewares/ratelimit.middleware";
import { IAuthMiddleware } from "../../Interfaces/Middleware/IAuthMiddleware";
import { IAdminController } from "../../Interfaces/Controller/IAdminController";

const router = express.Router();
const authMiddleware = container.get<IAuthMiddleware>('IAuthMiddleware');
const adminController = container.get<IAdminController>('IAdminController');


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
