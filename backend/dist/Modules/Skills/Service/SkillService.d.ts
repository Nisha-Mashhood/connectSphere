import { BaseService } from "../../../core/Services/BaseService.js";
import { SkillInterface as ISkill } from "../../../Interfaces/models/SkillInterface.js";
export declare class SkillsService extends BaseService {
    private skillsRepo;
    constructor();
    createSkill(data: Partial<ISkill>, imagePath?: string, fileSize?: number): Promise<ISkill>;
    getAllSkills(subcategoryId: string): Promise<ISkill[]>;
    getSkillById(id: string): Promise<ISkill | null>;
    updateSkill(id: string, data: Partial<ISkill>, imagePath?: string, fileSize?: number): Promise<ISkill | null>;
    deleteSkill(id: string): Promise<ISkill | null>;
    getSkills(): Promise<{
        _id: string;
        name: string;
    }[]>;
}
//# sourceMappingURL=SkillService.d.ts.map