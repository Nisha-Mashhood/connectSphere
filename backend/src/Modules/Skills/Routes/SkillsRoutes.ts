import { Router } from 'express';
import { SkillsController } from '../../../Modules/Skills/Controllers/SkillsController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { upload } from '../../../core/Utils/Multer.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';

const router = Router();
const skillsController = new SkillsController();
const authMiddleware = new AuthMiddleware();

router.post('/create-skill', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('skills_image')], skillsController.createSkill);
router.get('/get-skills/:subcategoryId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], skillsController.getAllSkills);
router.get('/get-skill/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], skillsController.getSkillById);
router.put('/update-skill/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('skills_image')], skillsController.updateSkill);
router.delete('/delete-skill/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], skillsController.deleteSkill);
router.get('/get-allSkills', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], skillsController.getSkills);

export default router;
