import express from "express";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { authorize, checkBlockedStatus, verifyToken } from "../middlewares/auth.middleware.js";
import * as collaborationController from '../controllers/collaboration.controller.js'

const router = express.Router();

//User- Mentor routes
router.post("/create-mentorprofile",[apiLimiter, verifyToken, checkBlockedStatus], collaborationController.TemporaryRequestController);
router.get("/get-mentor-requests",[apiLimiter, verifyToken, checkBlockedStatus], collaborationController.getMentorRequestsController);
router.post("/accept-request/:id",[apiLimiter, verifyToken, checkBlockedStatus], collaborationController.acceptRequestController);
router.post("/reject-request/:id",[apiLimiter, verifyToken, checkBlockedStatus], collaborationController.rejectRequestController);
router.get("/get-user-requests/:id",[apiLimiter, verifyToken, checkBlockedStatus], collaborationController.getRequsetForUserController);
router.post("/process-payment",[apiLimiter, verifyToken, checkBlockedStatus], collaborationController.makeStripePaymentController);
router.get('/get-collabData-user/:id',[apiLimiter, verifyToken, checkBlockedStatus], collaborationController.getCollabDataForUserController);
router.get('/get-collabData-mentor/:id',[apiLimiter, verifyToken, checkBlockedStatus], collaborationController.getCollabDataForMentorController);
router.delete('/cancel-collab/:collabId',[apiLimiter, verifyToken, checkBlockedStatus], collaborationController.deleteCollab);
router.get('/getCollab/:collabId', [apiLimiter, verifyToken, checkBlockedStatus], collaborationController.getCollabDeatilsbyCollabId);
router.get('/getCollabRequset/:requestId' , [apiLimiter, verifyToken, checkBlockedStatus], collaborationController.getRequestDeatilsbyRequestId);
router.put("/markUnavailable/:collabId", [apiLimiter, verifyToken, checkBlockedStatus], collaborationController.markUnavailableDays);
router.put("/updateTimeslot/:collabId", [apiLimiter, verifyToken, checkBlockedStatus], collaborationController.updateTemporarySlotChanges);
router.put("/approveTimeSlot/:collabId", [apiLimiter, verifyToken, checkBlockedStatus], collaborationController.approveTimeSlotRequest)
router.get("/locked-slots/:mentorId", [apiLimiter, verifyToken, checkBlockedStatus], verifyToken, collaborationController.getMentorLockedSlotsController);

//FOR ADMIN

router.get("/getAllRequest", [apiLimiter, verifyToken, authorize('admin')], collaborationController.getAllMentorRequests);
router.get("/getAllCollab",[apiLimiter, verifyToken, authorize('admin')], collaborationController.getAllCollabs);
export default router;