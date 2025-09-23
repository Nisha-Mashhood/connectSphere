import { ISkillDTO } from "../DTOs/ISkillDTO";
import { ISkill } from "../Models/ISkill";

export interface ISkillsService {
  createSkill: (data: Partial<ISkill>, imagePath?: string, fileSize?: number) => Promise<ISkillDTO>;
  getAllSkills: (subcategoryId: string) => Promise<ISkillDTO[]>;
  getSkillById: (id: string) => Promise<ISkillDTO | null>;
  updateSkill: (id: string, data: Partial<ISkill>, imagePath?: string, fileSize?: number) => Promise<ISkillDTO | null>;
  deleteSkill: (id: string) => Promise<ISkillDTO | null>;
  getSkills: () => Promise<{ _id: string; name: string }[]>;
}