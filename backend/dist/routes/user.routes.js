import express from "express";
import * as UserController from "../controllers/user.controller.js";
import { apiLimiter } from '../middlewares/ratelimit.middleware.js';
import { upload } from "../utils/multer.utils.js";
import { authorize, checkBlockedStatus, verifyToken } from "../middlewares/auth.middleware.js";
const router = express.Router();
router.get("/getallusers", [apiLimiter, verifyToken], UserController.getAllUsers);
router.get("/getuser/:id", [apiLimiter, verifyToken], UserController.getUserById);
router.put("updateuser/:id", [apiLimiter,
    verifyToken,
    checkBlockedStatus,
    upload.fields([
        { name: "profilePhoto", maxCount: 1 }, // For profile photo
        { name: "coverPhoto", maxCount: 1 }, // For cover photo
    ]),
], UserController.updateUserProfile);
router.put("/blockuser/:id", [apiLimiter, verifyToken, authorize('admin')], UserController.blockUser);
router.put("/unblockuser/:id", [apiLimiter, verifyToken, authorize('admin')], UserController.unblockUser);
router.put("/changerole/:id", [apiLimiter, verifyToken, authorize('admin')], UserController.changeRole);
export default router;
//# sourceMappingURL=user.routes.js.map