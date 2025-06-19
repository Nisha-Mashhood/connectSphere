import express from 'express';
import * as SubcategoryController from "../controllers/subcategory.controller.js";
import { apiLimiter } from '../middlewares/ratelimit.middleware.js'
import { upload } from '../core/Utils/Multer.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
const router = express.Router();
const authMiddleware = new AuthMiddleware();


router.post("/create-subcategory",[apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single("image")], SubcategoryController.createSubcategory);
router.get("/get-subcategories/:categoryId",[apiLimiter, authMiddleware.verifyToken], SubcategoryController.getAllSubcategories);
router.get("/get-subcategory/:id",[apiLimiter, authMiddleware.verifyToken], SubcategoryController.getSubcategoryById);
router.put("/update-subcategory/:id",  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single("image")], SubcategoryController.updateSubcategory);
router.delete("/delete-subcategory/:id",[apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], SubcategoryController.deleteSubcategory);

export default router;