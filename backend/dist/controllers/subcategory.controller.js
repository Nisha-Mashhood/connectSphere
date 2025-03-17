import * as SubcategoryService from "../services/subcategory.service.js";
export const createSubcategory = async (req, res) => {
    try {
        const imagePath = req.file?.path;
        const subcategory = await SubcategoryService.createSubcategory(req.body, imagePath);
        res.status(201).json({ message: "Subcategory created successfully", subcategory });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating subcategory", error: error.message });
    }
};
export const getAllSubcategories = async (req, res) => {
    try {
        const subcategories = await SubcategoryService.getAllSubcategories(req.params.categoryId);
        res.status(200).json(subcategories);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching subcategories", error: error.message });
    }
};
export const getSubcategoryById = async (req, res) => {
    try {
        const subcategory = await SubcategoryService.getSubcategoryById(req.params.id);
        if (!subcategory) {
            res.status(404).json({ message: "Subcategory not found" });
            return;
        }
        res.status(200).json(subcategory);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching subcategory", error: error.message });
    }
};
export const updateSubcategory = async (req, res) => {
    try {
        const imagePath = req.file?.path;
        const updatedSubcategory = await SubcategoryService.updateSubcategory(req.params.id, req.body, imagePath);
        if (!updatedSubcategory) {
            res.status(404).json({ message: "Subcategory not found" });
            return;
        }
        res.status(200).json({ message: "Subcategory updated successfully", updatedSubcategory });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating subcategory", error: error.message });
    }
};
export const deleteSubcategory = async (req, res) => {
    try {
        const deletedSubcategory = await SubcategoryService.deleteSubcategory(req.params.id);
        if (!deletedSubcategory) {
            res.status(404).json({ message: "Subcategory not found" });
            return;
        }
        res.status(200).json({ message: "Subcategory deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting subcategory", error: error.message });
    }
};
//# sourceMappingURL=subcategory.controller.js.map