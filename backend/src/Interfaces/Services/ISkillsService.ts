import { ISkill } from "../Models/ISkill";

export interface ISkillsService {
  createSkill: (data: Partial<ISkill>, imagePath?: string, fileSize?: number) => Promise<ISkill>;
  getAllSkills: (subcategoryId: string) => Promise<ISkill[]>;
  getSkillById: (id: string) => Promise<ISkill | null>;
  updateSkill: (id: string, data: Partial<ISkill>, imagePath?: string, fileSize?: number) => Promise<ISkill | null>;
  deleteSkill: (id: string) => Promise<ISkill | null>;
  getSkills: () => Promise<{ _id: string; name: string }[]>;
}