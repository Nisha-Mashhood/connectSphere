import { BaseController } from '../../../core/Controller/BaseController.js';
import logger from "../../../core/Utils/Logger.js";
import { SkillsService } from '../Service/SkillService.js';
import { SkillsRepository } from "../Repositry/SkillsRepositry.js";
export class SkillsController extends BaseController {
    skillsService;
    skillsRepo;
    constructor() {
        super();
        this.skillsService = new SkillsService();
        this.skillsRepo = new SkillsRepository();
    }
    async createSkill(req, res) {
        try {
            logger.debug(`Creating skill: ${req.body.name}`);
            const isDuplicate = await this.skillsRepo.findOne({
                name: req.body.name,
                subcategoryId: req.body.subcategoryId,
            });
            if (isDuplicate) {
                this.throwError(400, 'Skill name already exists in this subcategory');
            }
            const imagePath = req.file?.path;
            const fileSize = req.file?.size;
            const skill = await this.skillsService.createSkill(req.body, imagePath, fileSize);
            this.sendCreated(res, skill, 'Skill created successfully');
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async getAllSkills(req, res) {
        try {
            logger.debug(`Fetching skills for subcategory: ${req.params.subcategoryId}`);
            const skills = await this.skillsService.getAllSkills(req.params.subcategoryId);
            this.sendSuccess(res, skills, 'Skills fetched successfully');
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async getSkillById(req, res) {
        try {
            logger.debug(`Fetching skill: ${req.params.id}`);
            const skill = await this.skillsService.getSkillById(req.params.id);
            if (!skill) {
                this.throwError(404, 'Skill not found');
            }
            this.sendSuccess(res, skill, 'Skill fetched successfully');
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async updateSkill(req, res) {
        try {
            logger.debug(`Updating skill: ${req.params.id}`);
            const isDuplicate = await this.skillsRepo.findOne({
                name: req.body.name,
                subcategoryId: req.body.subcategoryId || (await this.skillsRepo.getSkillById(req.params.id))?.subcategoryId,
                _id: { $ne: req.params.id },
            });
            if (isDuplicate) {
                this.throwError(400, 'Skill name already exists in this subcategory');
            }
            const imagePath = req.file?.path;
            const fileSize = req.file?.size;
            const updatedSkill = await this.skillsService.updateSkill(req.params.id, req.body, imagePath, fileSize);
            if (!updatedSkill) {
                this.throwError(404, 'Skill not found');
            }
            this.sendSuccess(res, updatedSkill, 'Skill updated successfully');
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async deleteSkill(req, res) {
        try {
            logger.debug(`Deleting skill: ${req.params.id}`);
            const deletedSkill = await this.skillsService.deleteSkill(req.params.id);
            if (!deletedSkill) {
                this.throwError(404, 'Skill not found');
            }
            this.sendNoContent(res, 'Skill deleted successfully');
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async getSkills(_req, res) {
        try {
            logger.debug('Fetching all skills (name and ID only)');
            const skills = await this.skillsService.getSkills();
            this.sendSuccess(res, skills, 'Skills fetched successfully');
        }
        catch (error) {
            logger.error(`Error fetching skills: ${error}`);
            this.handleError(error, res);
        }
    }
}
//# sourceMappingURL=SkillsController.js.map