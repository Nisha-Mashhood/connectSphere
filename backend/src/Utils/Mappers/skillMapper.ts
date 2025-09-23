import { ISkill } from '../../Interfaces/Models/ISkill';
import { ISkillDTO } from '../../Interfaces/DTOs/ISkillDTO';
import { ICategory } from '../../Interfaces/Models/ICategory';
import { ISubcategory } from '../../Interfaces/Models/ISubcategory';
import { toCategoryDTO } from './categoryMapper';
import { toSubcategoryDTO } from './subcategoryMapper';
import logger from '../../Core/Utils/Logger';
import { Types } from 'mongoose';
import { ISubcategoryDTO } from '../../Interfaces/DTOs/ISubCategoryDTO';
import { ICategoryDTO } from '../../Interfaces/DTOs/ICategoryDTO';

export function toSkillDTO(skill: ISkill | null): ISkillDTO | null {
  if (!skill) {
    logger.warn('Attempted to map null skill to DTO');
    return null;
  }

  let categoryId: string;
  let category: ICategoryDTO | undefined;
  if (skill.categoryId) {
    if (typeof skill.categoryId === 'string') {
      categoryId = skill.categoryId;
    } else if (skill.categoryId instanceof Types.ObjectId) {
      categoryId = skill.categoryId.toString();
    } else {
      //ICategory object (populated)
      categoryId = (skill.categoryId as ICategory)._id.toString();
      const categoryDTO = toCategoryDTO(skill.categoryId as ICategory);
      category = categoryDTO ?? undefined;
    }
  } else {
    logger.warn(`Skill ${skill._id} has no categoryId`);
    categoryId = '';
  }

  let subcategoryId: string;
  let subcategory: ISubcategoryDTO | undefined;
  if (skill.subcategoryId) {
    if (typeof skill.subcategoryId === 'string') {
      subcategoryId = skill.subcategoryId;
    } else if (skill.subcategoryId instanceof Types.ObjectId) {
      subcategoryId = skill.subcategoryId.toString();
    } else {
      //ISubcategory object (populated)
      subcategoryId = (skill.subcategoryId as ISubcategory)._id.toString();
      const subcategoryDTO = toSubcategoryDTO(skill.subcategoryId as ISubcategory);
      subcategory = subcategoryDTO ?? undefined;
    }
  } else {
    logger.warn(`Skill ${skill._id} has no subcategoryId`);
    subcategoryId = '';
  }

  return {
    id: skill._id.toString(),
    skillId: skill.skillId,
    name: skill.name,
    categoryId,
    category,
    subcategoryId,
    subcategory,
    description: skill.description,
    imageUrl: skill.imageUrl ?? undefined,
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  };
}

export function toSkillDTOs(skills: ISkill[]): ISkillDTO[] {
  return skills
    .map(toSkillDTO)
    .filter((dto): dto is ISkillDTO => dto !== null);
}