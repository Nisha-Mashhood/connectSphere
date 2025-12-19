import { ClientSession } from "mongoose";
import { IMentorExperience } from "../Models/i-mentor-experience";
import { IBaseRepository } from "../../core/interfaces/Ibase-repositry";

export interface IMentorExperienceRepository extends IBaseRepository<IMentorExperience>{
  createOne(data: Partial<IMentorExperience>, options?: { session?: ClientSession }): Promise<IMentorExperience>;
  findByMentorId(mentorId: string): Promise<IMentorExperience[]>;
  updateById(id: string, data: Partial<IMentorExperience>): Promise<IMentorExperience | null>;
  updateMany(filter: object,data: Partial<IMentorExperience>): Promise<number>;
  deleteById(id: string): Promise<boolean>;
}