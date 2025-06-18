import { SkillInterface } from "../Interfaces/models/SkillInterface.js";
import * as SkillRepo from "../repositories/skills.repositry.js";
import { uploadMedia } from "../utils/cloudinary.utils.js";

export const createSkill = async (data: Partial<SkillInterface>, imagePath?: string, fileSize?: number) => {
    let imageUrl = null;
    if (imagePath) {
      const folder = "skill";
      const { url } = await uploadMedia(imagePath, folder, fileSize);
      imageUrl = url; 
    }
    return await SkillRepo.createSkill({ ...data, imageUrl });
  };

export const getAllSkills = async (subcategoryId:string) => {
  return await SkillRepo.getAllSkills(subcategoryId);
};


export const getSkillById = SkillRepo.getSkillById;

export const updateSkill = async (id: string, data: Partial<SkillInterface>, imagePath?: string, fileSize?:number) => {
    let imageUrl = null;
    if (imagePath) {
      const folder = "skill";
      const { url } = await uploadMedia(imagePath, folder, fileSize);
      imageUrl = url; 
    }
    return await SkillRepo.updateSkill(id, { ...data, ...(imageUrl && { imageUrl }) });
  };
export const deleteSkill = SkillRepo.deleteSkill;

// Get available skills
export const getSkills = async () => {
  try {
    return await SkillRepo.getSkills();
  } catch (error: any) {
    throw new Error("Error fetching skills: " + error.message);
  }
};