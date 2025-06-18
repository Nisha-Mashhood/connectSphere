import { Router } from 'express';
import { SubcategoryController } from '../../../Modules/Subcategory/Controllers/SubCategoryController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { upload } from '../../../utils/multer.utils.js';
import { authorize, checkBlockedStatus, verifyToken } from '../../../middlewares/auth.middleware.js';

const router = Router();
const subcategoryController = new SubcategoryController();

router.post('/subcategories', [apiLimiter, verifyToken, authorize('admin'), upload.single('image')], subcategoryController.createSubcategory);
router.get('/subcategories/:categoryId', [apiLimiter, verifyToken, checkBlockedStatus], subcategoryController.getAllSubcategories);
router.get('/subcategories/:id', [apiLimiter, verifyToken, checkBlockedStatus], subcategoryController.getSubcategoryById);
router.put('/subcategories/:id', [apiLimiter, verifyToken, authorize('admin'), upload.single('image')], subcategoryController.updateSubcategory);
router.delete('/subcategories/:id', [apiLimiter, verifyToken, authorize('admin')], subcategoryController.deleteSubcategory);

export default router;