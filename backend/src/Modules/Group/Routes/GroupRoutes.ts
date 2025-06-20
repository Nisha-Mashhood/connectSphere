import express from "express";
import { GroupController } from "../Controllers/GroupController.js";
import { apiLimiter } from "../../../middlewares/ratelimit.middleware.js";
import {
  AuthMiddleware
} from "../../../middlewares/auth.middleware.js";
import { upload } from "../../../core/Utils/Multer.js";

const router = express.Router();
const groupController = new GroupController();
const authMiddleware = new AuthMiddleware();

router.post(
  "/create-group",
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.createGroup.bind(groupController)
);

router.get(
  "/fetch-groups/:adminId",
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.getGroupDetails.bind(groupController)
);

router.get(
  "/group-details/:groupId",
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.getGroupById.bind(groupController)
);

router.get(
  "/group-details",
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.getAllGroups.bind(groupController)
);

router.post(
  "/send-groupRequest",
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.sendGroupRequest.bind(groupController)
);

router.get(
  "/group-request-details-GI/:groupId",
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.getGroupRequestsByGroupId.bind(groupController)
);

router.get(
  "/group-request-details-AI/:adminId",
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.getGroupRequestsByAdminId.bind(groupController)
);

router.get(
  "/group-request-details-UI/:userId",
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.getGroupRequestsByUserId.bind(groupController)
);

router.put(
  "/update-groupRequest",
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.updateGroupRequest.bind(groupController)
);

router.post(
  "/process-payment",
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.makeStripePayment.bind(groupController)
);

router.delete(
  "/remove-member",
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.removeGroupMember.bind(groupController)
);

router.delete(
  "/remove-group/:groupId",
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.deleteGroup.bind(groupController)
);

router.put(
  "/upload-group-picture/:groupId",
  [
    apiLimiter,
    authMiddleware.verifyToken,
    authMiddleware.checkBlockedStatus,
    upload.fields([
      { name: "profilePic", maxCount: 1 },
      { name: "coverPic", maxCount: 1 },
    ]),
  ],
  groupController.updateGroupImage.bind(groupController)
);

router.get(
  "/get-group-details-members/:userid",
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.getGroupDetailsForMembers.bind(groupController)
);

router.get(
  "/group-requests/:requestId",
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.getGroupRequestById.bind(groupController)
);

router.get(
  "/group-requests",
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize("admin")],
  groupController.getAllGroupRequests.bind(groupController)
);

export default router;