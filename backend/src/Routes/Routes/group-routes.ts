import express from "express";
import { apiLimiter } from "../../middlewares/ratelimit-middleware";
import { IAuthMiddleware } from '../../Interfaces/Middleware/i-auth-middleware';
import { upload } from "../../core/utils/multer";
import { GROUP_ROUTES } from "../Constants/group-routes";
import container from "../../container";
import { IGroupController } from "../../Interfaces/Controller/i-group-controller";

const router = express.Router();
const groupController = container.get<IGroupController>('IGroupController');
const authMiddleware = container.get<IAuthMiddleware>('IAuthMiddleware');


router.post(
  GROUP_ROUTES.CreateGroup,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.createGroup.bind(groupController)
);

router.get(
  GROUP_ROUTES.FetchGroups,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.getGroupDetails.bind(groupController)
);

router.get(
  GROUP_ROUTES.GetGroupById,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.getGroupById.bind(groupController)
);

router.get(
  GROUP_ROUTES.GetAllGroups,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.getAllGroups.bind(groupController)
);

router.post(
  GROUP_ROUTES.SendGroupRequest,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.sendGroupRequest.bind(groupController)
);

router.get(
  GROUP_ROUTES.GetGroupRequestsByGroupId,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.getGroupRequestsByGroupId.bind(groupController)
);

router.get(
  GROUP_ROUTES.GetGroupRequestsByAdminId,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.getGroupRequestsByAdminId.bind(groupController)
);

router.get(
  GROUP_ROUTES.GetGroupRequestsByUserId,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.getGroupRequestsByUserId.bind(groupController)
);

router.put(
  GROUP_ROUTES.UpdateGroupRequest,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.updateGroupRequest.bind(groupController)
);

router.post(
  GROUP_ROUTES.ProcessPayment,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.makeStripePayment.bind(groupController)
);

router.delete(
  GROUP_ROUTES.RemoveMember,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.removeGroupMember.bind(groupController)
);

router.delete(
  GROUP_ROUTES.RemoveGroup,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.deleteGroup.bind(groupController)
);

router.put(
  GROUP_ROUTES.UploadGroupPicture,
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
  GROUP_ROUTES.GetGroupDetailsForMembers,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.getGroupDetailsForMembers.bind(groupController)
);

router.get(
  GROUP_ROUTES.GetGroupRequestById,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  groupController.getGroupRequestById.bind(groupController)
);

router.get(
 GROUP_ROUTES.GetAllGroupRequests,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize("admin")],
  groupController.getAllGroupRequests.bind(groupController)
);

export default router;