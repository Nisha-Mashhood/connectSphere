import express from 'express';
import * as SkillController from "../controllers/skills.controller.js";
import { upload } from '../utils/multer.utils.js';
const router = express.Router();
router.post("/create-skill", upload.single("image"), SkillController.createSkill);
router.get("/get-skills/:subcategoryId", SkillController.getAllSkills);
router.get("/get-skill/:id", SkillController.getSkillById);
router.put("/update-skill/:id", upload.single("image"), SkillController.updateSkill);
router.delete("/delete-skill/:id", SkillController.deleteSkill);
export default router;
//# sourceMappingURL=skills.routes.js.map