import express from 'express';
const router = express.Router();
import * as GroupController from "../controllers/group.controller.js";
import { checkBlockedStatus, verifyToken } from '../middlewares/auth.middleware.js';
import { apiLimiter } from '../middlewares/ratelimit.middleware.js';


router.post("/create-group",[apiLimiter, verifyToken, checkBlockedStatus], GroupController.createGroup);
router.get("/fetch-groups/:adminId",[apiLimiter, verifyToken, checkBlockedStatus], GroupController.getGroupDetails);
router.get("/group-details",[apiLimiter, verifyToken, checkBlockedStatus], GroupController.getGroups);
router.post("/send-groupRequest",[apiLimiter,verifyToken,checkBlockedStatus],GroupController.sendGroupRequset);
router.get("/group-request-details-GI/:groupId",[apiLimiter, verifyToken, checkBlockedStatus], GroupController.getrequsetDeatilsbyGroupId);
router.get("/group-request-details-AI/:adminId",[apiLimiter, verifyToken, checkBlockedStatus], GroupController.getrequsetDeatilsbyAdminId);
router.get("/group-requset-details-UI/:userId",[apiLimiter, verifyToken, checkBlockedStatus], GroupController.getrequsetDeatilsbyUserId);
router.put("/update-groupRequest",[apiLimiter,verifyToken,checkBlockedStatus],GroupController.updaterequsetDeatils);


export default router;