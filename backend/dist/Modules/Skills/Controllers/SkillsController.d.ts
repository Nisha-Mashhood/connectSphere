import { Request, Response } from 'express';
import { BaseController } from '../../../core/Controller/BaseController.js';
import { SkillInterface as ISkill } from "../../../Interfaces/models/SkillInterface.js";
interface SkillRequest extends Request {
    body: Partial<ISkill>;
    params: {
        id?: string;
        subcategoryId?: string;
    };
}
export declare class SkillsController extends BaseController {
    private skillsService;
    private skillsRepo;
    constructor();
    createSkill: (req: SkillRequest, res: Response) => Promise<void>;
    getAllSkills: (req: SkillRequest, res: Response) => Promise<void>;
    getSkillById: (req: SkillRequest, res: Response) => Promise<void>;
    updateSkill: (req: SkillRequest, res: Response) => Promise<void>;
    deleteSkill: (req: SkillRequest, res: Response) => Promise<void>;
    getSkills: (_req: Request, res: Response) => Promise<void>;
}
export {};
//# sourceMappingURL=SkillsController.d.ts.map