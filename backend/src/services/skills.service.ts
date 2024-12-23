import { SkillInterface } from "src/models/skills.model.js";
import * as SkillRepo from "../repositories/skills.repositry.js";
import { uploadImage } from "../utils/cloudinary.utils.js";

export const createSkill = async (data: Partial<SkillInterface>, imagePath?: string) => {
    let imageUrl = null;
    if (imagePath) {
      const folder = "skill";
      imageUrl = await uploadImage(imagePath, folder);
    }
    return await SkillRepo.createSkill({ ...data, imageUrl });
  };
export const getAllSkills = async (subcategoryId:string) => {
  return await SkillRepo.getAllSkills(subcategoryId);
};


export const getSkillById = SkillRepo.getSkillById;

export const updateSkill = async (id: string, data: Partial<SkillInterface>, imagePath?: string) => {
    let imageUrl = null;
    if (imagePath) {
      const folder = "skill";
      imageUrl = await uploadImage(imagePath, folder);
    }
    return await SkillRepo.updateSkill(id, { ...data, ...(imageUrl && { imageUrl }) });
  };
export const deleteSkill = SkillRepo.deleteSkill;
