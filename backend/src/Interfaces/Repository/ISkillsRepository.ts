import { ISkill } from '../Models/ISkill';

export interface ISkillsRepository {
  createSkill(data: Partial<ISkill>): Promise<ISkill>;
  getAllSkills(subcategoryId: string): Promise<ISkill[]>;
  getSkillById(id: string): Promise<ISkill | null>;
  updateSkill(id: string, data: Partial<ISkill>): Promise<ISkill | null>;
  deleteSkill(id: string): Promise<ISkill | null>;
  deleteManySkills(categoryId: string): Promise<{ deletedCount: number }>;
  deleteManySkillsBySubcategoryId(subcategoryId: string): Promise<{ deletedCount: number }>;
  getSkills(): Promise<{ _id: string; name: string }[]>;
  isDuplicateSkill(name: string, subcategoryId: string): Promise<boolean>;
  findOne(query: Partial<ISkill>): Promise<ISkill | null>;
}