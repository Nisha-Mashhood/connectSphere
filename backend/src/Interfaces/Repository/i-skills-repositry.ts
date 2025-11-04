import { ISkill } from '../Models/i-skill';

export interface ISkillsRepository {
  createSkill(data: Partial<ISkill>): Promise<ISkill>;
  getAllSkills(subcategoryId: string, query: { search?: string; page?: number; limit?: number }): Promise<{ skills: ISkill[]; total: number }>;
  getSkillById(id: string): Promise<ISkill | null>;
  updateSkill(id: string, data: Partial<ISkill>): Promise<ISkill | null>;
  deleteSkill(id: string): Promise<ISkill | null>;
  deleteManySkills(categoryId: string): Promise<{ deletedCount: number }>;
  deleteManySkillsBySubcategoryId(subcategoryId: string): Promise<{ deletedCount: number }>;
  getSkills(): Promise<{ _id: string; name: string }[]>;
  isDuplicateSkill(name: string, subcategoryId: string, excludeId?: string): Promise<boolean>;
  findOne(query: Partial<ISkill>): Promise<ISkill | null>;
}