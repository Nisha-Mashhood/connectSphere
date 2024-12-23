import express from 'express';
import * as SubcategoryController from "../controllers/subcategory.controller.js";
import { upload } from '../utils/multer.utils.js';
const router = express.Router();
router.post("/create-subcategory", upload.single("image"), SubcategoryController.createSubcategory);
router.get("/get-subcategories/:categoryId", SubcategoryController.getAllSubcategories);
router.get("/get-subcategory/:id", SubcategoryController.getSubcategoryById);
router.put("/update-subcategory/:id", upload.single("image"), SubcategoryController.updateSubcategory);
router.delete("/delete-subcategory/:id", SubcategoryController.deleteSubcategory);
export default router;
//# sourceMappingURL=sucategory.routes.js.map