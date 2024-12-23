import { Skill, SkillInterface } from "../models/skills.model.js";

// Create Skill
export const createSkill = async (data: Partial<SkillInterface>) => {
  return await Skill.create(data);
};

// Get all skills
export const getAllSkills = async (subcategoryId:string) => {
  return await Skill.find({subcategoryId}).populate("categoryId").populate("subcategoryId");
};

// Get a skill by ID
export const getSkillById = async (id: string) => {
  return await Skill.findById(id).populate("categoryId").populate("subcategoryId");
};

// Update a skill
export const updateSkill = async (id: string, data: Partial<SkillInterface>) => {
  return await Skill.findByIdAndUpdate(id, data, { new: true });
};

// Delete a skill
export const deleteSkill = async (id: string) => {
  return await Skill.findByIdAndDelete(id);
};
