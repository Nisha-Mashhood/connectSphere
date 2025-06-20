import { Router } from 'express';
import { CategoryController } from '../../../Modules/Category/Controllers/CategoryController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { upload } from '../../../core/Utils/Multer.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';
const router = Router();
const categoryController = new CategoryController();
const authMiddleware = new AuthMiddleware();
router.post('/create-category', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('image')], categoryController.createCategory);
router.get('/get-categories', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], categoryController.getAllCategories);
router.get('/get-category/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], categoryController.getCategoryById);
router.put('/update-category/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('image')], categoryController.updateCategory);
router.delete('/delete-category/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], categoryController.deleteCategory);
export default router;
//# sourceMappingURL=CategoryRoutes.js.map