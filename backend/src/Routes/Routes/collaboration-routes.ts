import { Router } from 'express';
import container from "../../container";
import { COLLABORATION_ROUTES } from '../Constants/collaboration-routes';
import { apiLimiter } from '../../middlewares/ratelimit-middleware';
import { IAuthMiddleware } from '../../Interfaces/Middleware/i-auth-middleware';
import { ICollaborationController } from '../../Interfaces/Controller/i-collaboration-controller';

const router = Router();
const collabController = container.get<ICollaborationController>('ICollaborationController');
const authMiddleware = container.get<IAuthMiddleware>('IAuthMiddleware');


router.post(COLLABORATION_ROUTES.CreateMentorProfile, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.TemporaryRequestController);
router.get(COLLABORATION_ROUTES.GetMentorRequests, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.getMentorRequestsController);
router.post(COLLABORATION_ROUTES.AcceptRequest, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.acceptRequestController);
router.post(COLLABORATION_ROUTES.RejectRequest, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.rejectRequestController);
router.get(COLLABORATION_ROUTES.GetUserRequests, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.getRequestForUserController);
router.post(COLLABORATION_ROUTES.ProcessPayment, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.makeStripePaymentController);
router.get(COLLABORATION_ROUTES.GetCollabDataUser, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.getCollabDataForUserController);
router.get(COLLABORATION_ROUTES.GetCollabDataMentor, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.getCollabDataForMentorController);
router.delete(COLLABORATION_ROUTES.CancelAndRefundCollab, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.cancelAndRefundCollab);
router.get(COLLABORATION_ROUTES.GetCollab, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.getCollabDetailsByCollabId);
router.get(COLLABORATION_ROUTES.GetCollabRequest, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.getRequestDetailsByRequestId);
router.put(COLLABORATION_ROUTES.MarkUnavailable, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.markUnavailableDays);
router.put(COLLABORATION_ROUTES.UpdateTimeslot, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.updateTemporarySlotChanges);
router.put(COLLABORATION_ROUTES.ApproveTimeSlot, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.approveTimeSlotRequest);
router.get(COLLABORATION_ROUTES.GetLockedSlots, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.getMentorLockedSlotsController);

router.get(COLLABORATION_ROUTES.GetAllMentorRequests, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], collabController.getAllMentorRequests);
router.get(COLLABORATION_ROUTES.GetAllCollabs, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], collabController.getAllCollabs);
// router.post(COLLABORATION_ROUTES.RefundCollab, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus,], collabController.processRefund);
router.get(COLLABORATION_ROUTES.GetReceiptDownload,[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus,], collabController.downloadReceiptController);
router.delete(COLLABORATION_ROUTES.DeleteMentorRequest,[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],collabController.deleteMentorRequestController);
export default router;


