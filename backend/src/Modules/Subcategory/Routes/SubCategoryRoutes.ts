import { Router } from 'express';
import { SubcategoryController } from '../../../Modules/Subcategory/Controllers/SubCategoryController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { upload } from '../../../core/Utils/Multer.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';

const router = Router();
const subcategoryController = new SubcategoryController();
const authMiddleware = new AuthMiddleware();

router.post('/create-subcategory', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('image')], subcategoryController.createSubcategory);
router.get('/get-subcategories/:categoryId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], subcategoryController.getAllSubcategories);
router.get('/get-subcategory/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], subcategoryController.getSubcategoryById);
router.put('/update-subcategory/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single('image')], subcategoryController.updateSubcategory);
router.delete('/delete-subcategory/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], subcategoryController.deleteSubcategory);

export default router;
