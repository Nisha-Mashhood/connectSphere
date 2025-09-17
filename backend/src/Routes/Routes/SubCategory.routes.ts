import { Router } from 'express';
import { apiLimiter } from '../../middlewares/ratelimit.middleware';
import { upload } from '../../Core/Utils/Multer';
import { IAuthMiddleware } from '../../Interfaces/Middleware/IAuthMiddleware';
import { SUBCATEGORY_ROUTES } from '../Constants/SubCategory.routes';
import container from "../../container";
import { ISubcategoryController } from '../../Interfaces/Controller/ISubCategoryController';

const router = Router();
const subcategoryController = container.get<ISubcategoryController>('ISubCategoryController');
const authMiddleware = container.get<IAuthMiddleware>('IAuthMiddleware');

router.post(SUBCATEGORY_ROUTES.CreateSubcategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('image')], subcategoryController.createSubcategory);
router.get(SUBCATEGORY_ROUTES.GetSubcategories, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], subcategoryController.getAllSubcategories);
router.get(SUBCATEGORY_ROUTES.GetSubcategoryById, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], subcategoryController.getSubcategoryById);
router.put(SUBCATEGORY_ROUTES.UpdateSubcategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('image')], subcategoryController.updateSubcategory);
router.delete(SUBCATEGORY_ROUTES.DeleteSubcategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], subcategoryController.deleteSubcategory);

export default router;
