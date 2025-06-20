export const SKILLS_ROUTES = {
  CreateSkill: '/create-skill',
  GetSkillsBySubcategory: '/get-skills/:subcategoryId',
  GetSkillById: '/get-skill/:id',
  UpdateSkill: '/update-skill/:id',
  DeleteSkill: '/delete-skill/:id',
  GetAllSkills: '/get-allSkills',
} as const;