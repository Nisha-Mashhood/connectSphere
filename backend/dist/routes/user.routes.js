import express from "express";
import * as UserController from "../controllers/user.controller.js";
import { upload } from "../utils/multer.utils.js";
const router = express.Router();
router.get("/getallusers", UserController.getAllUsers);
router.get("/getuser/:id", UserController.getUserById);
router.put("updateuser/:id", upload.fields([
    { name: "profilePhoto", maxCount: 1 }, // For profile photo
    { name: "coverPhoto", maxCount: 1 }, // For cover photo
]), UserController.updateUserProfile);
router.put("/blockuser/:id", UserController.blockUser);
router.put("/unblockuser/:id", UserController.unblockUser);
router.put("/changerole/:id", UserController.changeRole);
export default router;
//# sourceMappingURL=user.routes.js.map