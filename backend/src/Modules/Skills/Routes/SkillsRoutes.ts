import { Router } from 'express';
import { SkillsController } from '../../../Modules/Skills/Controllers/SkillsController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { upload } from '../../../utils/multer.utils.js';
import { authorize, checkBlockedStatus, verifyToken } from '../../../middlewares/auth.middleware.js';

const router = Router();
const skillsController = new SkillsController();

router.post('/skills', [apiLimiter, verifyToken, authorize('admin'), upload.single('skills_image')], skillsController.createSkill);
router.get('/skills/:subcategoryId', [apiLimiter, verifyToken, checkBlockedStatus], skillsController.getAllSkills);
router.get('/skills/:id', [apiLimiter, verifyToken, checkBlockedStatus], skillsController.getSkillById);
router.put('/skills/:id', [apiLimiter, verifyToken, authorize('admin'), upload.single('skills_image')], skillsController.updateSkill);
router.delete('/skills/:id', [apiLimiter, verifyToken, authorize('admin')], skillsController.deleteSkill);
router.get('/skills', [apiLimiter, verifyToken, checkBlockedStatus], skillsController.getSkills);

export default router;