import { Router } from 'express';
import { SubcategoryController } from '../../Controllers/SubCategory.controller';
import { apiLimiter } from '../../middlewares/ratelimit.middleware';
import { upload } from '../../Core/Utils/Multer';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { SUBCATEGORY_ROUTES } from '../Constants/SubCategory.routes';

const router = Router();
const subcategoryController = new SubcategoryController();
const authMiddleware = new AuthMiddleware();

router.post(SUBCATEGORY_ROUTES.CreateSubcategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('image')], subcategoryController.createSubcategory);
router.get(SUBCATEGORY_ROUTES.GetSubcategories, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], subcategoryController.getAllSubcategories);
router.get(SUBCATEGORY_ROUTES.GetSubcategoryById, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], subcategoryController.getSubcategoryById);
router.put(SUBCATEGORY_ROUTES.UpdateSubcategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('image')], subcategoryController.updateSubcategory);
router.delete(SUBCATEGORY_ROUTES.DeleteSubcategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], subcategoryController.deleteSubcategory);

export default router;
