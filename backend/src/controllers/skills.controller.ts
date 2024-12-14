import { Request, Response } from "express";
import * as SkillService from "../services/skills.service.js";

export const createSkill = async(req:Request, res:Response) => {
    try {
        const skill = await SkillService.createSkill(req.body);
        res.status(201).json({ message: "Skill created successfully", skill });
      } catch (error:any) {
        res.status(500).json({ message: "Error creating skill", error: error.message });
      }
}

export const getAllSkills = async(req:Request, res:Response) => {
    try {
        const skills = await SkillService.getAllSkills();
        res.status(200).json(skills);
      } catch (error:any) {
        res.status(500).json({ message: "Error fetching skills", error: error.message });
      }
}

export const getSkillById = async(req:Request, res:Response) => {
    try {
        const skill = await SkillService.getSkillById(req.params.id);
        if (!skill) {
          return res.status(404).json({ message: "Skill not found" });
        }
        res.status(200).json(skill);
      } catch (error:any) {
        res.status(500).json({ message: "Error fetching skill", error: error.message });
      }
}

export const updateSkill = async(req:Request, res:Response) => {
    try {
        const updatedSkill = await SkillService.updateSkill(req.params.id, req.body);
        if (!updatedSkill) {
          return res.status(404).json({ message: "Skill not found" });
        }
        res.status(200).json({ message: "Skill updated successfully", updatedSkill });
      } catch (error:any) {
        res.status(500).json({ message: "Error updating skill", error: error.message });
      }
}

export const deleteSkill = async(req:Request, res:Response) => {
    try {
        const deletedSkill = await SkillService.deleteSkill(req.params.id);
        if (!deletedSkill) {
          return res.status(404).json({ message: "Skill not found" });
        }
        res.status(200).json({ message: "Skill deleted successfully" });
      } catch (error:any) {
        res.status(500).json({ message: "Error deleting skill", error: error.message });
      }
}