import { Router } from 'express';
import { apiLimiter } from '../../middlewares/ratelimit-middleware';
import { upload } from '../../core/utils/multer';
import { IAuthMiddleware } from '../../Interfaces/Middleware/i-auth-middleware';
import { CATEGORY_ROUTES } from '../Constants/category-routes';
import container from "../../container";
import { ICategoryController } from '../../Interfaces/Controller/i-category-controller';

const router = Router();
const categoryController = container.get<ICategoryController>('ICategoryController');
const authMiddleware = container.get<IAuthMiddleware>('IAuthMiddleware');

router.post(CATEGORY_ROUTES.CreateCategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('image')], categoryController.createCategory);
router.get(CATEGORY_ROUTES.GetCategories, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], categoryController.getAllCategories);
router.get(CATEGORY_ROUTES.FetchCategories, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], categoryController.fetchAllCategories);
router.get(CATEGORY_ROUTES.GetCategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], categoryController.getCategoryById);
router.put(CATEGORY_ROUTES.UpdateCategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('image')], categoryController.updateCategory);
router.delete(CATEGORY_ROUTES.DeleteCategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], categoryController.deleteCategory);

export default router;
