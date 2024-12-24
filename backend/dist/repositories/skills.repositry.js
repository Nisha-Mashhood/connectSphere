import { Skill } from "../models/skills.model.js";
// Create Skill
export const createSkill = async (data) => {
    return await Skill.create(data);
};
// Get all skills
export const getAllSkills = async (subcategoryId) => {
    return await Skill.find({ subcategoryId })
        .populate("categoryId")
        .populate("subcategoryId");
};
// Get a skill by ID
export const getSkillById = async (id) => {
    return await Skill.findById(id)
        .populate("categoryId")
        .populate("subcategoryId");
};
// Update a skill
export const updateSkill = async (id, data) => {
    return await Skill.findByIdAndUpdate(id, data, { new: true });
};
// Delete a skill
export const deleteSkill = async (id) => {
    return await Skill.findByIdAndDelete(id);
};
// Delete many skills by categoryId
export const deleteManySkills = async (categoryId) => {
    try {
        const result = await Skill.deleteMany({ categoryId });
        return result;
    }
    catch (error) {
        throw new Error(`Error deleting skills: ${error.message}`);
    }
};
// Delete many skills by subactegoryId
export const deleteManySkillsbySubcategoryId = async (subcategoryId) => {
    try {
        const result = await Skill.deleteMany({ subcategoryId });
        return result;
    }
    catch (error) {
        throw new Error(`Error deleting skills: ${error.message}`);
    }
};
//# sourceMappingURL=skills.repositry.js.map