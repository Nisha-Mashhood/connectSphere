import express from 'express';
import * as CategoryController from "../controllers/category.controller.js";
import { apiLimiter } from '../middlewares/ratelimit.middleware.js'
import { upload } from "../core/Utils/Multer.js";
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
const router = express.Router();
const authMiddleware = new AuthMiddleware();


router.post("/create-category",[apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single("image")], CategoryController.createCategory);
router.get("/get-categories",[apiLimiter, authMiddleware.verifyToken,authMiddleware.checkBlockedStatus], CategoryController.getAllCategories);
router.get("/get-category/:id",[apiLimiter, authMiddleware.verifyToken,authMiddleware.checkBlockedStatus], CategoryController.getCategoryById);
router.put("/update-category/:id", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), upload.single("image")],  CategoryController.updateCategory);
router.delete("/delete-category/:id",[apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], CategoryController.deleteCategory);



export default router;