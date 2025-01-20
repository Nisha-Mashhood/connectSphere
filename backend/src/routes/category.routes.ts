import express from 'express';
import * as CategoryController from "../controllers/category.controller.js";
import { apiLimiter } from '../middlewares/ratelimit.middleware.js'
import { upload } from "../utils/multer.utils.js";
import { authorize, checkBlockedStatus, verifyToken } from '../middlewares/auth.middleware.js';
const router = express.Router();


router.post("/create-category",[apiLimiter, verifyToken, authorize('admin'), upload.single("image")], CategoryController.createCategory);
router.get("/get-categories",[apiLimiter, verifyToken,checkBlockedStatus], CategoryController.getAllCategories);
router.get("/get-category/:id",[apiLimiter, verifyToken,checkBlockedStatus], CategoryController.getCategoryById);
router.put("/update-category/:id", [apiLimiter, verifyToken, authorize('admin'), upload.single("image")],  CategoryController.updateCategory);
router.delete("/delete-category/:id",[apiLimiter, verifyToken, authorize('admin')], CategoryController.deleteCategory);



export default router;