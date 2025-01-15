import express from 'express';
import * as SubcategoryController from "../controllers/subcategory.controller.js";
import { apiLimiter } from '../middlewares/ratelimit.middleware.js'
import { upload } from '../utils/multer.utils.js';
import { authorize, verifyToken } from '../middlewares/auth.middleware.js';
const router = express.Router();


router.post("/create-subcategory",[apiLimiter, verifyToken, authorize('admin'), upload.single("image")], SubcategoryController.createSubcategory);
router.get("/get-subcategories/:categoryId",[apiLimiter, verifyToken], SubcategoryController.getAllSubcategories);
router.get("/get-subcategory/:id",[apiLimiter, verifyToken], SubcategoryController.getSubcategoryById);
router.put("/update-subcategory/:id",  [apiLimiter, verifyToken, authorize('admin'), upload.single("image")], SubcategoryController.updateSubcategory);
router.delete("/delete-subcategory/:id",[apiLimiter, verifyToken, authorize('admin')], SubcategoryController.deleteSubcategory);

export default router;