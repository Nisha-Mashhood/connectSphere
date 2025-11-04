import { ISkillDTO } from "../DTOs/i-skill-dto";
import { ISkill } from "../Models/i-skill";

export interface ISkillsService {
  createSkill: (data: Partial<ISkill>, imagePath?: string, fileSize?: number) => Promise<ISkillDTO>;
  getAllSkills: (subcategoryId: string, query: { search?: string; page?: number; limit?: number }) =>  Promise<{ skills: ISkillDTO[]; total: number }>;
  getSkillById: (id: string) => Promise<ISkillDTO | null>;
  updateSkill: (id: string, data: Partial<ISkill>, imagePath?: string, fileSize?: number) => Promise<ISkillDTO | null>;
  deleteSkill: (id: string) => Promise<ISkillDTO | null>;
  getSkills: () => Promise<{ _id: string; name: string }[]>;
}