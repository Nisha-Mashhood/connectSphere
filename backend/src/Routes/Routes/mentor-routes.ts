import { Router } from 'express';
import { apiLimiter } from '../../middlewares/ratelimit-middleware';
import { IAuthMiddleware } from '../../Interfaces/Middleware/i-auth-middleware';
import { upload } from '../../core/utils/multer';
import { MENTOR_ROUTES } from '../Constants/mentor-routes';
import container from "../../container";
import { IMentorController } from '../../Interfaces/Controller/i-mentor-controller';

const router = Router();
const mentorController = container.get<IMentorController>('IMentorController');
const authMiddleware = container.get<IAuthMiddleware>('IAuthMiddleware');


router.post(MENTOR_ROUTES.CreateMentorProfile, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, upload.array('certificates', 2)], mentorController.createMentor);
router.get(MENTOR_ROUTES.CheckMentorStatus, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], mentorController.checkMentorStatus);
router.get(MENTOR_ROUTES.GetAllMentorRequests, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], mentorController.getAllMentorRequests);
router.put(MENTOR_ROUTES.ApproveMentorRequest, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], mentorController.approveMentorRequest);
router.put(MENTOR_ROUTES.RejectMentorRequest, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], mentorController.rejectMentorRequest);
router.put(MENTOR_ROUTES.CancelMentorship, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], mentorController.cancelMentorship);
router.get(MENTOR_ROUTES.GetMentorDetails, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], mentorController.getMentorDetails);
router.get(MENTOR_ROUTES.GetMentorExperience, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], mentorController.getMentorExperiences);
router.put(MENTOR_ROUTES.UpdateMentorProfile, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], mentorController.updateMentorProfile);
router.get(MENTOR_ROUTES.GetAllMentors, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], mentorController.getAllMentors);
router.get(MENTOR_ROUTES.GetMentorByUserId, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], mentorController.getMentorByUserId);
router.get(MENTOR_ROUTES.GetMentorAnalytics, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], mentorController.getMentorAnalytics);
router.get(MENTOR_ROUTES.GetSalesReport, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], mentorController.getSalesReport);
router.post(MENTOR_ROUTES.AddExperience, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], mentorController.addExperience);
router.put(MENTOR_ROUTES.UpdateExperience, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], mentorController.updateExperience);
router.delete(MENTOR_ROUTES.DeleteExperience, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], mentorController.deleteExperience);
router.get(MENTOR_ROUTES.DownloadSalesReposrt,[apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize("admin"),], mentorController.downloadSalesReportPDF
);
export default router;