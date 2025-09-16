import { ISkill } from '../../Interfaces/Models/ISkill';
import { ISkillDTO } from '../../Interfaces/DTOs/ISkillDTO';

export function toSkillDTO(skill: ISkill | null): ISkillDTO | null {
  if (!skill) return null;

  return {
    id: skill._id.toString(),
    skillId: skill.skillId,
    name: skill.name,
    categoryId: skill.categoryId.toString(),
    subcategoryId: skill.subcategoryId.toString(),
    description: skill.description,
    imageUrl: skill.imageUrl ?? null,
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  };
}

export function toSkillDTOs(skills: ISkill[]): ISkillDTO[] {
  return skills.map(toSkillDTO).filter((dto): dto is ISkillDTO => dto !== null);
}
