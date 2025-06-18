import { Router } from 'express';
import { CollaborationController } from '../Controllers/CollaborationController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { authorize, checkBlockedStatus, verifyToken } from '../../../middlewares/auth.middleware.js';

const router = Router();
const collabController = new CollaborationController();

router.post('/collaborations/request', [apiLimiter, verifyToken, checkBlockedStatus], collabController.TemporaryRequestController);
router.get('/collaborations/mentor-requests', [apiLimiter, verifyToken, checkBlockedStatus], collabController.getMentorRequestsController);
router.post('/collaborations/accept-request/:id', [apiLimiter, verifyToken, checkBlockedStatus], collabController.acceptRequestController);
router.post('/collaborations/reject-request/:id', [apiLimiter, verifyToken, checkBlockedStatus], collabController.rejectRequestController);
router.get('/collaborations/user-requests/:id', [apiLimiter, verifyToken, checkBlockedStatus], collabController.getRequestForUserController);
router.post('/collaborations/process-payment', [apiLimiter, verifyToken, checkBlockedStatus], collabController.makeStripePaymentController);
router.get('/collaborations/user/:id', [apiLimiter, verifyToken, checkBlockedStatus], collabController.getCollabDataForUserController);
router.get('/collaborations/mentor/:id', [apiLimiter, verifyToken, checkBlockedStatus], collabController.getCollabDataForMentorController);
router.delete('/collaborations/:collabId', [apiLimiter, verifyToken, checkBlockedStatus], collabController.deleteCollab);
router.get('/collaborations/:collabId', [apiLimiter, verifyToken, checkBlockedStatus], collabController.getCollabDetailsByCollabId);
router.get('/collaborations/requests/:requestId', [apiLimiter, verifyToken, checkBlockedStatus], collabController.getRequestDetailsByRequestId);
router.put('/collaborations/mark-unavailable/:collabId', [apiLimiter, verifyToken, checkBlockedStatus], collabController.markUnavailableDays);
router.put('/collaborations/update-timeslot/:collabId', [apiLimiter, verifyToken, checkBlockedStatus], collabController.updateTemporarySlotChanges);
router.put('/collaborations/approve-timeslot/:collabId', [apiLimiter, verifyToken, checkBlockedStatus], collabController.approveTimeSlotRequest);
router.get('/collaborations/locked-slots/:mentorId', [apiLimiter, verifyToken, checkBlockedStatus], collabController.getMentorLockedSlotsController);

router.get('/collaborations/admin/requests', [apiLimiter, verifyToken, authorize('admin')], collabController.getAllMentorRequests);
router.get('/collaborations/admin', [apiLimiter, verifyToken, authorize('admin')], collabController.getAllCollabs);

export default router;
