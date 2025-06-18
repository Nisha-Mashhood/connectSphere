import { Router } from 'express';
import { CategoryController } from '../../../Modules/Category/Controllers/CategoryController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { upload } from '../../../utils/multer.utils.js';
import { authorize, checkBlockedStatus, verifyToken } from '../../../middlewares/auth.middleware.js';

const router = Router();
const categoryController = new CategoryController();

router.post('/categories', [apiLimiter, verifyToken, authorize('admin'), upload.single('image')], categoryController.createCategory);
router.get('/categories', [apiLimiter, verifyToken, checkBlockedStatus], categoryController.getAllCategories);
router.get('/categories/:id', [apiLimiter, verifyToken, checkBlockedStatus], categoryController.getCategoryById);
router.put('/categories/:id', [apiLimiter, verifyToken, authorize('admin'), upload.single('image')], categoryController.updateCategory);
router.delete('/categories/:id', [apiLimiter, verifyToken, authorize('admin')], categoryController.deleteCategory);

export default router;