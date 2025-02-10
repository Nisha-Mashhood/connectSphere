import express from "express";
const router = express.Router();
import * as GroupController from "../controllers/group.controller.js";
import {
  checkBlockedStatus,
  verifyToken,
} from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { upload } from "../utils/multer.utils.js";

router.post(
  "/create-group",
  [apiLimiter, verifyToken, checkBlockedStatus],
  GroupController.createGroup
);
router.get(
  "/fetch-groups/:adminId",
  [apiLimiter, verifyToken, checkBlockedStatus],
  GroupController.getGroupDetails
);
router.get(
  "/group-details/:groupId",
  [apiLimiter, verifyToken, checkBlockedStatus],
  GroupController.getGroupDetailsByGroupId
);
router.get(
  "/group-details",
  [apiLimiter, verifyToken, checkBlockedStatus],
  GroupController.getGroups
);
router.post(
  "/send-groupRequest",
  [apiLimiter, verifyToken, checkBlockedStatus],
  GroupController.sendGroupRequset
);
router.get(
  "/group-request-details-GI/:groupId",
  [apiLimiter, verifyToken, checkBlockedStatus],
  GroupController.getrequsetDeatilsbyGroupId
);
router.get(
  "/group-request-details-AI/:adminId",
  [apiLimiter, verifyToken, checkBlockedStatus],
  GroupController.getrequsetDeatilsbyAdminId
);
router.get(
  "/group-requset-details-UI/:userId",
  [apiLimiter, verifyToken, checkBlockedStatus],
  GroupController.getrequsetDeatilsbyUserId
);
router.put(
  "/update-groupRequest",
  [apiLimiter, verifyToken, checkBlockedStatus],
  GroupController.updaterequsetDeatils
);
router.post(
  "/process-payment",
  [apiLimiter, verifyToken, checkBlockedStatus],
  GroupController.makeStripePaymentController
);
router.delete(
  "/remove-member",
  [apiLimiter, verifyToken, checkBlockedStatus],
  GroupController.removeGroupMember
);
router.delete(
  "/remove-group/:groupId",
  [apiLimiter, verifyToken, checkBlockedStatus],
  GroupController.deleteGroup
);
router.put(
  "/upload-group-picture/:groupId",
  [apiLimiter, verifyToken, checkBlockedStatus],
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "coverPic", maxCount: 1 },
  ]),
  GroupController.updateGroupImage
);

router.get(
  "/get-group-details-members/:userid",
  [apiLimiter, verifyToken, checkBlockedStatus],
  GroupController.fetchGroupDetailsForMembers
);
export default router;
