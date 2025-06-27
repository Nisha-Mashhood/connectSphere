import { Router } from 'express';
import { SkillsController } from '../../../Modules/Skills/Controllers/SkillsController';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware';
import { upload } from '../../../core/Utils/Multer';
import { AuthMiddleware } from '../../../middlewares/auth.middleware';
import { SKILLS_ROUTES } from '../Constant/Skills.routes';

const router = Router();
const skillsController = new SkillsController();
const authMiddleware = new AuthMiddleware();


router.post(SKILLS_ROUTES.CreateSkill, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('skills_image')], skillsController.createSkill);
router.get(SKILLS_ROUTES.GetSkillsBySubcategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], skillsController.getAllSkills);
router.get(SKILLS_ROUTES.GetSkillById, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], skillsController.getSkillById);
router.put(SKILLS_ROUTES.UpdateSkill, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('skills_image')], skillsController.updateSkill);
router.delete(SKILLS_ROUTES.DeleteSkill, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], skillsController.deleteSkill);
router.get(SKILLS_ROUTES.GetAllSkills, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], skillsController.getSkills);

export default router;
