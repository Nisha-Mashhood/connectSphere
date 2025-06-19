import * as SkillService from "../services/skills.service.js";
export const createSkill = async (req, res) => {
    try {
        const imagePath = req.file?.path;
        const fileSize = req.file?.size;
        const skill = await SkillService.createSkill(req.body, imagePath, fileSize);
        res.status(201).json({ message: "Skill created successfully", skill });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error creating skill", error: error.message });
    }
};
export const getAllSkills = async (req, res) => {
    try {
        const skills = await SkillService.getAllSkills(req.params.subcategoryId);
        res.status(200).json(skills);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching skills", error: error.message });
    }
};
export const getSkillById = async (req, res) => {
    try {
        const skill = await SkillService.getSkillById(req.params.id);
        if (!skill) {
            res.status(404).json({ message: "Skill not found" });
            return;
        }
        res.status(200).json(skill);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching skill", error: error.message });
    }
};
export const updateSkill = async (req, res) => {
    try {
        const imagePath = req.file?.path;
        const fileSize = req.file?.size;
        const updatedSkill = await SkillService.updateSkill(req.params.id, req.body, imagePath, fileSize);
        if (!updatedSkill) {
            res.status(404).json({ message: "Skill not found" });
            return;
        }
        res
            .status(200)
            .json({ message: "Skill updated successfully", updatedSkill });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error updating skill", error: error.message });
    }
};
export const deleteSkill = async (req, res) => {
    try {
        const deletedSkill = await SkillService.deleteSkill(req.params.id);
        if (!deletedSkill) {
            res.status(404).json({ message: "Skill not found" });
            return;
        }
        res.status(200).json({ message: "Skill deleted successfully" });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error deleting skill", error: error.message });
    }
};
//fetch skills
export const getSkills = async (_, res) => {
    try {
        const skills = await SkillService.getSkills();
        res.status(200).json({ skills });
    }
    catch (error) {
        console.error("Error fetching skills:", error.message);
        res
            .status(500)
            .json({ message: "Error fetching skills", error: error.message });
    }
};
//# sourceMappingURL=skills.controller.js.map