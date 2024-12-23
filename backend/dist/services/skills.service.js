import * as SkillRepo from "../repositories/skills.repositry.js";
import { uploadImage } from "../utils/cloudinary.utils.js";
export const createSkill = async (data, imagePath) => {
    let imageUrl = null;
    if (imagePath) {
        const folder = "skill";
        imageUrl = await uploadImage(imagePath, folder);
    }
    return await SkillRepo.createSkill({ ...data, imageUrl });
};
export const getAllSkills = async (subcategoryId) => {
    return await SkillRepo.getAllSkills(subcategoryId);
};
export const getSkillById = SkillRepo.getSkillById;
export const updateSkill = async (id, data, imagePath) => {
    let imageUrl = null;
    if (imagePath) {
        const folder = "skill";
        imageUrl = await uploadImage(imagePath, folder);
    }
    return await SkillRepo.updateSkill(id, { ...data, ...(imageUrl && { imageUrl }) });
};
export const deleteSkill = SkillRepo.deleteSkill;
//# sourceMappingURL=skills.service.js.map