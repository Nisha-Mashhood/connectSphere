import express from 'express';
import * as SkillController from "../controllers/skills.controller.js";
import { apiLimiter } from '../middlewares/ratelimit.middleware.js';
import { upload } from '../utils/multer.utils.js';
import { authorize, verifyToken } from '../middlewares/auth.middleware.js';
const router = express.Router();
router.post("/create-skill", [apiLimiter, verifyToken, authorize('admin'), upload.single("image")], SkillController.createSkill);
router.get("/get-skills/:subcategoryId", [apiLimiter, verifyToken,], SkillController.getAllSkills);
router.get("/get-skill/:id", [apiLimiter, verifyToken,], SkillController.getSkillById);
router.put("/update-skill/:id", [apiLimiter, verifyToken, authorize('admin'), upload.single("image")], SkillController.updateSkill);
router.delete("/delete-skill/:id", [apiLimiter, verifyToken, authorize('admin')], SkillController.deleteSkill);
export default router;
//# sourceMappingURL=skills.routes.js.map