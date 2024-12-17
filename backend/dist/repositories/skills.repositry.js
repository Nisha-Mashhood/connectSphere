import { Skill } from "../models/skills.model.js";
// Create Skill
export const createSkill = async (data) => {
    return await Skill.create(data);
};
// Get all skills
export const getAllSkills = async () => {
    return await Skill.find().populate("categoryId").populate("subcategoryId");
};
// Get a skill by ID
export const getSkillById = async (id) => {
    return await Skill.findById(id).populate("categoryId").populate("subcategoryId");
};
// Update a skill
export const updateSkill = async (id, data) => {
    return await Skill.findByIdAndUpdate(id, data, { new: true });
};
// Delete a skill
export const deleteSkill = async (id) => {
    return await Skill.findByIdAndDelete(id);
};
//# sourceMappingURL=skills.repositry.js.map