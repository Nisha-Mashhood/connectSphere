import { Router } from 'express';
import { CategoryController } from '../../../Modules/Category/Controllers/CategoryController';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware';
import { upload } from '../../../core/Utils/Multer';
import { AuthMiddleware } from '../../../middlewares/auth.middleware';
import { CATEGORY_ROUTES } from '../Constant/Category.routes';

const router = Router();
const categoryController = new CategoryController();
const authMiddleware = new AuthMiddleware();

router.post(CATEGORY_ROUTES.CreateCategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('image')], categoryController.createCategory);
router.get(CATEGORY_ROUTES.GetCategories, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], categoryController.getAllCategories);
router.get(CATEGORY_ROUTES.GetCategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], categoryController.getCategoryById);
router.put(CATEGORY_ROUTES.UpdateCategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('image')], categoryController.updateCategory);
router.delete(CATEGORY_ROUTES.DeleteCategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], categoryController.deleteCategory);

export default router;
