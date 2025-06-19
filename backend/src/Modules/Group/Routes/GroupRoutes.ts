import express from "express";
import { GroupController } from "../Controllers/GroupController.js";
import { apiLimiter } from "../../../middlewares/ratelimit.middleware.js";
import {
  verifyToken,
  checkBlockedStatus,
  authorize,
} from "../../../middlewares/auth.middleware.js";
import { upload } from "../../../utils/multer.utils.js";

const router = express.Router();
const groupController = new GroupController();

router.post(
  "/create-group",
  [apiLimiter, verifyToken, checkBlockedStatus],
  groupController.createGroup.bind(groupController)
);

router.get(
  "/fetch-groups/:adminId",
  [apiLimiter, verifyToken, checkBlockedStatus],
  groupController.getGroupDetails.bind(groupController)
);

router.get(
  "/group-details/:groupId",
  [apiLimiter, verifyToken, checkBlockedStatus],
  groupController.getGroupById.bind(groupController)
);

router.get(
  "/group-details",
  [apiLimiter, verifyToken, checkBlockedStatus],
  groupController.getAllGroups.bind(groupController)
);

router.post(
  "/send-groupRequest",
  [apiLimiter, verifyToken, checkBlockedStatus],
  groupController.sendGroupRequest.bind(groupController)
);

router.get(
  "/group-request-details-GI/:groupId",
  [apiLimiter, verifyToken, checkBlockedStatus],
  groupController.getGroupRequestsByGroupId.bind(groupController)
);

router.get(
  "/group-request-details-AI/:adminId",
  [apiLimiter, verifyToken, checkBlockedStatus],
  groupController.getGroupRequestsByAdminId.bind(groupController)
);

router.get(
  "/group-request-details-UI/:userId",
  [apiLimiter, verifyToken, checkBlockedStatus],
  groupController.getGroupRequestsByUserId.bind(groupController)
);

router.put(
  "/update-groupRequest",
  [apiLimiter, verifyToken, checkBlockedStatus],
  groupController.updateGroupRequest.bind(groupController)
);

router.post(
  "/process-payment",
  [apiLimiter, verifyToken, checkBlockedStatus],
  groupController.makeStripePayment.bind(groupController)
);

router.delete(
  "/remove-member",
  [apiLimiter, verifyToken, checkBlockedStatus],
  groupController.removeGroupMember.bind(groupController)
);

router.delete(
  "/remove-group/:groupId",
  [apiLimiter, verifyToken, checkBlockedStatus],
  groupController.deleteGroup.bind(groupController)
);

router.put(
  "/upload-group-picture/:groupId",
  [
    apiLimiter,
    verifyToken,
    checkBlockedStatus,
    upload.fields([
      { name: "profilePic", maxCount: 1 },
      { name: "coverPic", maxCount: 1 },
    ]),
  ],
  groupController.updateGroupImage.bind(groupController)
);

router.get(
  "/get-group-details-members/:userid",
  [apiLimiter, verifyToken, checkBlockedStatus],
  groupController.getGroupDetailsForMembers.bind(groupController)
);

router.get(
  "/group-requests/:requestId",
  [apiLimiter, verifyToken, checkBlockedStatus],
  groupController.getGroupRequestById.bind(groupController)
);

router.get(
  "/group-requests",
  [apiLimiter, verifyToken, authorize("admin")],
  groupController.getAllGroupRequests.bind(groupController)
);

export default router;
