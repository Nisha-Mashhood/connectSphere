import { BaseRepository } from "../../../core/Repositries/BaseRepositry.js";
import { SkillInterface as ISkill } from "../../../Interfaces/models/SkillInterface.js";
export declare class SkillsRepository extends BaseRepository<ISkill> {
    constructor();
    createSkill: (data: Partial<ISkill>) => Promise<ISkill>;
    getAllSkills: (subcategoryId: string) => Promise<ISkill[]>;
    getSkillById: (id: string) => Promise<ISkill | null>;
    updateSkill: (id: string, data: Partial<ISkill>) => Promise<ISkill | null>;
    deleteSkill: (id: string) => Promise<ISkill | null>;
    deleteManySkills: (categoryId: string) => Promise<{
        deletedCount: number;
    }>;
    deleteManySkillsBySubcategoryId: (subcategoryId: string) => Promise<{
        deletedCount: number;
    }>;
    getSkills: () => Promise<{
        _id: string;
        name: string;
    }[]>;
}
//# sourceMappingURL=SkillsRepositry.d.ts.map