import express from "express";
import * as UserController from "../controllers/user.controller.js";
import { apiLimiter } from '../middlewares/ratelimit.middleware.js';
import { upload } from "../core/Utils/Multer.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();
const authMiddleware = new AuthMiddleware();
router.get("/getallusers", [apiLimiter, authMiddleware.verifyToken], UserController.getAllUsers);
router.get("/getuser/:id", [apiLimiter, authMiddleware.verifyToken], UserController.getUserById);
router.put("updateuser/:id", [apiLimiter,
    authMiddleware.verifyToken,
    authMiddleware.checkBlockedStatus,
    upload.fields([
        { name: "profilePhoto", maxCount: 1 }, // For profile photo
        { name: "coverPhoto", maxCount: 1 }, // For cover photo
    ]),
], UserController.updateUserProfile);
router.put("/blockuser/:id", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], UserController.blockUser);
router.put("/unblockuser/:id", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], UserController.unblockUser);
router.put("/changerole/:id", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], UserController.changeRole);
export default router;
//# sourceMappingURL=user.routes.js.map