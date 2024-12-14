import { Request, Response } from "express";
import * as SubcategoryService from "../services/subcategory.service.js";

export const createSubcategory = async(req:Request, res:Response) => {
    try {
        const subcategory = await SubcategoryService.createSubcategory(req.body);
        res.status(201).json({ message: "Subcategory created successfully", subcategory });
      } catch (error:any) {
        res.status(500).json({ message: "Error creating subcategory", error: error.message });
      }
}

export const getAllSubcategories = async(req:Request, res:Response) => {
    try {
        const subcategories = await SubcategoryService.getAllSubcategories();
        res.status(200).json(subcategories);
      } catch (error:any) {
        res.status(500).json({ message: "Error fetching subcategories", error: error.message });
      }
}

export const getSubcategoryById = async(req:Request, res:Response) => {
    try {
        const subcategory = await SubcategoryService.getSubcategoryById(req.params.id);
        if (!subcategory) {
          return res.status(404).json({ message: "Subcategory not found" });
        }
        res.status(200).json(subcategory);
      } catch (error:any) {
        res.status(500).json({ message: "Error fetching subcategory", error: error.message });
      }
}

export const updateSubcategory = async(req:Request, res:Response) => {
    try {
        const updatedSubcategory = await SubcategoryService.updateSubcategory(req.params.id, req.body);
        if (!updatedSubcategory) {
          return res.status(404).json({ message: "Subcategory not found" });
        }
        res.status(200).json({ message: "Subcategory updated successfully", updatedSubcategory });
      } catch (error:any) {
        res.status(500).json({ message: "Error updating subcategory", error: error.message });
      }
}

export const deleteSubcategory = async(req:Request, res:Response) => {
    try {
        const deletedSubcategory = await SubcategoryService.deleteSubcategory(req.params.id);
        if (!deletedSubcategory) {
          return res.status(404).json({ message: "Subcategory not found" });
        }
        res.status(200).json({ message: "Subcategory deleted successfully" });
      } catch (error:any) {
        res.status(500).json({ message: "Error deleting subcategory", error: error.message });
      }
}