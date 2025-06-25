import { Router } from 'express';
import { SubcategoryController } from '../../../Modules/Subcategory/Controllers/SubCategoryController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { upload } from '../../../core/Utils/Multer.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';
import { SUBCATEGORY_ROUTES } from '../Constant/SubCategory.routes.js';
const router = Router();
const subcategoryController = new SubcategoryController();
const authMiddleware = new AuthMiddleware();
router.post(SUBCATEGORY_ROUTES.CreateSubcategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('image')], subcategoryController.createSubcategory);
router.get(SUBCATEGORY_ROUTES.GetSubcategories, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], subcategoryController.getAllSubcategories);
router.get(SUBCATEGORY_ROUTES.GetSubcategoryById, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], subcategoryController.getSubcategoryById);
router.put(SUBCATEGORY_ROUTES.UpdateSubcategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('image')], subcategoryController.updateSubcategory);
router.delete(SUBCATEGORY_ROUTES.DeleteSubcategory, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], subcategoryController.deleteSubcategory);
export default router;
//# sourceMappingURL=SubCategoryRoutes.js.map