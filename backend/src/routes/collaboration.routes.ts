import express from "express";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import * as collaborationController from '../controllers/collaboration.controller.js'

const router = express.Router();
const authMiddleware = new AuthMiddleware();

//User- Mentor routes
router.post("/create-mentorprofile",[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collaborationController.TemporaryRequestController);
router.get("/get-mentor-requests",[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collaborationController.getMentorRequestsController);
router.post("/accept-request/:id",[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collaborationController.acceptRequestController);
router.post("/reject-request/:id",[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collaborationController.rejectRequestController);
router.get("/get-user-requests/:id",[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collaborationController.getRequsetForUserController);
router.post("/process-payment",[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collaborationController.makeStripePaymentController);
router.get('/get-collabData-user/:id',[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collaborationController.getCollabDataForUserController);
router.get('/get-collabData-mentor/:id',[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collaborationController.getCollabDataForMentorController);
router.delete('/cancel-collab/:collabId',[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collaborationController.deleteCollab);
router.get('/getCollab/:collabId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collaborationController.getCollabDeatilsbyCollabId);
router.get('/getCollabRequset/:requestId' , [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collaborationController.getRequestDeatilsbyRequestId);
router.put("/markUnavailable/:collabId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collaborationController.markUnavailableDays);
router.put("/updateTimeslot/:collabId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collaborationController.updateTemporarySlotChanges);
router.put("/approveTimeSlot/:collabId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], collaborationController.approveTimeSlotRequest)
router.get("/locked-slots/:mentorId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], authMiddleware.verifyToken, collaborationController.getMentorLockedSlotsController);

//FOR ADMIN

router.get("/getAllRequest", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], collaborationController.getAllMentorRequests);
router.get("/getAllCollab",[apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], collaborationController.getAllCollabs);
export default router;