import { Request, Response } from "express";
import * as SkillService from "../services/skills.service.js";

export const createSkill = async(req:Request, res:Response): Promise<void> => {
    try {
      const imagePath = req.file?.path; 
      const fileSize = req.file?.size
        const skill = await SkillService.createSkill(req.body,imagePath, fileSize);
        res.status(201).json({ message: "Skill created successfully", skill });
      } catch (error:any) {
        res.status(500).json({ message: "Error creating skill", error: error.message });
      }
}

export const getAllSkills = async(req:Request, res:Response): Promise<void> => {
    try {
        const skills = await SkillService.getAllSkills(req.params.subcategoryId);
        res.status(200).json(skills);
      } catch (error:any) {
        res.status(500).json({ message: "Error fetching skills", error: error.message });
      }
}



export const getSkillById = async(req:Request, res:Response): Promise<void> => {
    try {
        const skill = await SkillService.getSkillById(req.params.id);
        if (!skill) {
          res.status(404).json({ message: "Skill not found" });
          return
        }
        res.status(200).json(skill);
      } catch (error:any) {
        res.status(500).json({ message: "Error fetching skill", error: error.message });
      }
}

export const updateSkill = async(req:Request, res:Response): Promise<void> => {
    try {
      const imagePath = req.file?.path; 
      const fileSize = req.file?.size
        const updatedSkill = await SkillService.updateSkill(req.params.id, req.body,imagePath, fileSize);
        if (!updatedSkill) {
          res.status(404).json({ message: "Skill not found" });
          return 
        }
        res.status(200).json({ message: "Skill updated successfully", updatedSkill });
      } catch (error:any) {
        res.status(500).json({ message: "Error updating skill", error: error.message });
      }
}

export const deleteSkill = async(req:Request, res:Response): Promise<void> => {
    try {
        const deletedSkill = await SkillService.deleteSkill(req.params.id);
        if (!deletedSkill) {
          res.status(404).json({ message: "Skill not found" });
          return 
        }
        res.status(200).json({ message: "Skill deleted successfully" });
      } catch (error:any) {
        res.status(500).json({ message: "Error deleting skill", error: error.message });
      }
}


//fetch skills 
export const getSkills = async(_:Request, res:Response) : Promise<void> =>{
  try {
    const skills = await SkillService.getSkills(); 
    res.status(200).json({skills});
  } catch (error: any) {
    console.error('Error fetching skills:', error.message);
    res.status(500).json({ message: "Error fetching skills", error: error.message });
  }
}
