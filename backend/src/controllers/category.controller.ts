import { Request, Response } from "express";
import * as CategoryService from "../services/category.service.js";

export const createCategory = async(req:Request, res:Response) => {
    try {
        const category = await CategoryService.createCategory(req.body);
        res.status(201).json({ message: "Category created successfully", category });
      } catch (error:any) {
        res.status(500).json({ message: "Error creating category", error: error.message });
      }
}

export const getAllCategories = async(req:Request, res:Response) => {
    try {
        const categories = await CategoryService.getAllCategories();
        res.status(200).json(categories);
      } catch (error:any) {
        res.status(500).json({ message: "Error fetching categories", error: error.message });
      }
}

export const getCategoryById = async(req:Request, res:Response) => {
    try {
        const category = await CategoryService.getCategoryById(req.params.id);
        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(category);
      } catch (error:any) {
        res.status(500).json({ message: "Error fetching category", error: error.message });
      }
}

export const updateCategory = async(req:Request, res:Response) => {
    try {
        const updatedCategory = await CategoryService.updateCategory(req.params.id, req.body);
        if (!updatedCategory) {
          return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ message: "Category updated successfully", updatedCategory });
      } catch (error:any) {
        res.status(500).json({ message: "Error updating category", error: error.message });
      }
}

export const deleteCategory = async(req:Request, res:Response) => {
    try {
        const deletedCategory = await CategoryService.deleteCategory(req.params.id);
        if (!deletedCategory) {
          return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ message: "Category deleted successfully" });
      } catch (error:any) {
        res.status(500).json({ message: "Error deleting category", error: error.message });
      }
}