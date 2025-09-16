export interface ISkillDTO {
  id: string;
  skillId: string;
  name: string;
  categoryId: string;
  subcategoryId: string;
  description?: string;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
