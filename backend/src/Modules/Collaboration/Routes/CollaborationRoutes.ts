import { Router } from 'express';
import { CollaborationController } from '../Controllers/CollaborationController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';

const router = Router();
const collabController = new CollaborationController();
const authMiddleware = new AuthMiddleware();

router.post('/collaborations/request', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.TemporaryRequestController);
router.get('/collaborations/mentor-requests', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.getMentorRequestsController);
router.post('/collaborations/accept-request/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.acceptRequestController);
router.post('/collaborations/reject-request/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.rejectRequestController);
router.get('/collaborations/user-requests/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.getRequestForUserController);
router.post('/collaborations/process-payment', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.makeStripePaymentController);
router.get('/collaborations/user/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.getCollabDataForUserController);
router.get('/collaborations/mentor/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.getCollabDataForMentorController);
router.delete('/collaborations/:collabId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.deleteCollab);
router.get('/collaborations/:collabId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.getCollabDetailsByCollabId);
router.get('/collaborations/requests/:requestId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.getRequestDetailsByRequestId);
router.put('/collaborations/mark-unavailable/:collabId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.markUnavailableDays);
router.put('/collaborations/update-timeslot/:collabId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.updateTemporarySlotChanges);
router.put('/collaborations/approve-timeslot/:collabId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.approveTimeSlotRequest);
router.get('/collaborations/locked-slots/:mentorId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collabController.getMentorLockedSlotsController);

router.get('/collaborations/admin/requests', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], collabController.getAllMentorRequests);
router.get('/collaborations/admin', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], collabController.getAllCollabs);

export default router;
