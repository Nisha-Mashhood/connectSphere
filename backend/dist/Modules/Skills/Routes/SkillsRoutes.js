import { Router } from 'express';
import { SkillsController } from '../../../Modules/Skills/Controllers/SkillsController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { upload } from '../../../core/Utils/Multer.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';
const router = Router();
const skillsController = new SkillsController();
const authMiddleware = new AuthMiddleware();
router.post('/skills', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('skills_image')], skillsController.createSkill);
router.get('/skills/:subcategoryId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], skillsController.getAllSkills);
router.get('/skills/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], skillsController.getSkillById);
router.put('/skills/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('skills_image')], skillsController.updateSkill);
router.delete('/skills/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], skillsController.deleteSkill);
router.get('/skills', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], skillsController.getSkills);
export default router;
//# sourceMappingURL=SkillsRoutes.js.map