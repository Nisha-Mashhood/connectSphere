import { SkillInterface } from "../Interfaces/models/SkillInterface.js";
import { Skill } from "../models/skills.model.js";

// Create Skill
export const createSkill = async (data: Partial<SkillInterface>) => {
  return await Skill.create(data);
};

// Get all skills
export const getAllSkills = async (subcategoryId: string) => {
  return await Skill.find({ subcategoryId })
    .populate("categoryId")
    .populate("subcategoryId");
};


// Get a skill by ID
export const getSkillById = async (id: string) => {
  return await Skill.findById(id)
    .populate("categoryId")
    .populate("subcategoryId");
};

// Update a skill
export const updateSkill = async (
  id: string,
  data: Partial<SkillInterface>
) => {
  return await Skill.findByIdAndUpdate(id, data, { new: true });
};

// Delete a skill
export const deleteSkill = async (id: string) => {
  return await Skill.findByIdAndDelete(id);
};

// Delete many skills by categoryId
export const deleteManySkills = async (categoryId: string) => {
  try {
    const result = await Skill.deleteMany({ categoryId });
    return result;
  } catch (error: any) {
    throw new Error(`Error deleting skills: ${error.message}`);
  }
};

// Delete many skills by subactegoryId
export const deleteManySkillsbySubcategoryId = async ( subcategoryId: string) => {
  try {
    const result = await Skill.deleteMany({subcategoryId});
    return result;
  } catch (error: any) {
    throw new Error(`Error deleting skills: ${error.message}`);
  }
};

//get all skills
export const getSkills = async() =>{
  return await Skill.find({}, { name: 1, _id: 1 });
}