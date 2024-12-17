import express from 'express';
import * as SkillController from "../controllers/skills.controller.js";
const router = express.Router();
router.post("/create-skill", SkillController.createSkill);
router.get("/get-skills", SkillController.getAllSkills);
router.get("/get-skill/:id", SkillController.getSkillById);
router.put("/update-skill/:id", SkillController.updateSkill);
router.delete("/delete-skill/:id", SkillController.deleteSkill);
export default router;
//# sourceMappingURL=skills.routes.js.map