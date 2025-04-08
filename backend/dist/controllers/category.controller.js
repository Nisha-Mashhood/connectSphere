import * as CategoryService from "../services/category.service.js";
export const createCategory = async (req, res) => {
    try {
        const imagePath = req.file?.path;
        const fileSize = req.file?.size;
        // console.log(req.body);
        // console.log(imagePath);
        const isDuplicate = await CategoryService.isDuplicateCategoryName(req.body.name);
        if (isDuplicate) {
            res.status(400).json({ message: "Category name already exists" });
            return;
        }
        const category = await CategoryService.createCategory(req.body, imagePath, fileSize);
        res.status(201).json({ message: "Category created successfully", category });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating category", error: error.message });
    }
};
export const getAllCategories = async (_, res) => {
    try {
        const categories = await CategoryService.getAllCategories();
        res.status(200).json(categories);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
};
export const getCategoryById = async (req, res) => {
    try {
        const category = await CategoryService.getCategoryById(req.params.id);
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        res.status(200).json(category);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching category", error: error.message });
    }
};
export const updateCategory = async (req, res) => {
    try {
        const imagePath = req.file?.path;
        const fileSize = req.file?.size;
        // console.log(req.body);
        // console.log(imagePath);
        const isDuplicate = await CategoryService.isDuplicateCategoryName(req.body.name, req.params.id);
        if (isDuplicate) {
            res.status(400).json({ message: "Category name already exists" });
            return;
        }
        const updatedCategory = await CategoryService.updateCategory(req.params.id, req.body, imagePath, fileSize);
        if (!updatedCategory) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        res.status(200).json({ message: "Category updated successfully", updatedCategory });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating category", error: error.message });
    }
};
export const deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await CategoryService.deleteCategory(req.params.id);
        if (!deletedCategory) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        res.status(200).json({ message: "Category deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting category", error: error.message });
    }
};
//# sourceMappingURL=category.controller.js.map