import express from 'express';
import * as SubcategoryController from "../controllers/subcategory.controller.js";
const router = express.Router();
router.post("/create-subcategory", SubcategoryController.createSubcategory);
router.get("/get-subcategorys", SubcategoryController.getAllSubcategories);
router.get("/get-subcategory/:id", SubcategoryController.getSubcategoryById);
router.put("/update-subcategory/:id", SubcategoryController.updateSubcategory);
router.delete("/delete-subcategory/:id", SubcategoryController.deleteSubcategory);
export default router;
//# sourceMappingURL=sucategory.routes.js.map