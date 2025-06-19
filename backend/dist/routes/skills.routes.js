import express from 'express';
import * as SkillController from "../controllers/skills.controller.js";
import { apiLimiter } from '../middlewares/ratelimit.middleware.js';
import { upload } from '../core/Utils/Multer.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
const router = express.Router();
const authMiddleware = new AuthMiddleware();
router.post("/create-skill", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single("image")], SkillController.createSkill);
router.get("/get-skills/:subcategoryId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], SkillController.getAllSkills);
router.get("/get-skill/:id", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], SkillController.getSkillById);
router.put("/update-skill/:id", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single("image")], SkillController.updateSkill);
router.delete("/delete-skill/:id", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], SkillController.deleteSkill);
router.get('/get-allSkills', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], SkillController.getSkills);
export default router;
//# sourceMappingURL=skills.routes.js.map