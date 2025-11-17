import express from "express";
import container from "../../container";
import { ADMIN_DASHBOARD_ROUTES } from "../Constants/admin-dashboard-routes";
import { apiLimiter } from "../../middlewares/ratelimit-middleware";
import { IAuthMiddleware } from "../../Interfaces/Middleware/i-auth-middleware";
import { IAdminController } from "../../Interfaces/Controller/i-admin-controller";
import { upload } from "../../core/utils/multer";

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
router.get(ADMIN_DASHBOARD_ROUTES.GetAdminDetails, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getAdminProfileDetails);
router.put(ADMIN_DASHBOARD_ROUTES.UpdateAdminDetails, [apiLimiter, authMiddleware.verifyToken, upload.fields([{ name: 'profilePic', maxCount: 1 }]), authMiddleware.authorize('admin')], adminController.updateAdminDetails);

export default router;
