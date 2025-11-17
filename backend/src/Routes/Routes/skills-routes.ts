import { Router } from 'express';
import { apiLimiter } from '../../middlewares/ratelimit-middleware';
import { upload } from '../../core/utils/multer';
import { IAuthMiddleware } from '../../Interfaces/Middleware/i-auth-middleware';
import { SKILLS_ROUTES } from '../Constants/skills-routes';
import container from "../../container";
import { ISkillsController } from '../../Interfaces/Controller/i-skills-controller';

const router = Router();
const skillsController = container.get<ISkillsController>('ISkillsController');
const authMiddleware = container.get<IAuthMiddleware>('IAuthMiddleware');


router.post(SKILLS_ROUTES.CreateSkill, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('image')], skillsController.createSkill);
router.get(SKILLS_ROUTES.GetSkillsBySubcategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], skillsController.getAllSkills);
router.get(SKILLS_ROUTES.GetSkillById, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], skillsController.getSkillById);
router.put(SKILLS_ROUTES.UpdateSkill, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('image')], skillsController.updateSkill);
router.delete(SKILLS_ROUTES.DeleteSkill, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], skillsController.deleteSkill);
router.get(SKILLS_ROUTES.GetAllSkills, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], skillsController.getSkills);

export default router;
