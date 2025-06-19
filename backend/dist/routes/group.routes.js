import express from "express";
const router = express.Router();
import * as GroupController from "../controllers/group.controller.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { upload } from "../core/Utils/Multer.js";
const authMiddleware = new AuthMiddleware();
router.post("/create-group", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], GroupController.createGroup);
router.get("/fetch-groups/:adminId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], GroupController.getGroupDetails);
router.get("/group-details/:groupId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], GroupController.getGroupDetailsByGroupId);
router.get("/group-details", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], GroupController.getGroups);
router.post("/send-groupRequest", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], GroupController.sendGroupRequset);
router.get("/group-request-details-GI/:groupId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], GroupController.getrequsetDeatilsbyGroupId);
router.get("/group-request-details-AI/:adminId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], GroupController.getrequsetDeatilsbyAdminId);
router.get("/group-requset-details-UI/:userId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], GroupController.getrequsetDeatilsbyUserId);
router.put("/update-groupRequest", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], GroupController.updaterequsetDeatils);
router.post("/process-payment", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], GroupController.makeStripePaymentController);
router.delete("/remove-member", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], GroupController.removeGroupMember);
router.delete("/remove-group/:groupId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], GroupController.deleteGroup);
router.put("/upload-group-picture/:groupId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], upload.fields([{ name: "profilePic", maxCount: 1 }, { name: "coverPic", maxCount: 1 },]), GroupController.updateGroupImage);
router.get("/get-group-details-members/:userid", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], GroupController.fetchGroupDetailsForMembers);
// router.get("/groups/:groupId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], GroupController.getGroupDetailsByIdController);
router.get("/group-requests/:requestId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], GroupController.getGroupRequestByIdController);
// Get all groups (Admin only)
// router.get("/groups", [apiLimiter, authMiddleware.verifyToken, authorize("admin")], GroupController.getAllGroupsController);
router.get("/group-requests", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize("admin")], GroupController.getAllGroupRequestsController);
export default router;
//# sourceMappingURL=group.routes.js.map