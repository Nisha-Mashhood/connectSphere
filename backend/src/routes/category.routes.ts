import express from 'express';
import * as CategoryController from "../controllers/category.controller.js";
const router = express.Router();


router.post("/create-category", CategoryController.createCategory);
router.get("/get-categories", CategoryController.getAllCategories);
router.get("/get-category/:id", CategoryController.getCategoryById);
router.put("/update-category/:id", CategoryController.updateCategory);
router.delete("/delete-category/:id", CategoryController.deleteCategory);


export default router;