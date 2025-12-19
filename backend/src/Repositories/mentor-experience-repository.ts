import { injectable } from "inversify";
import { Types, Model } from "mongoose";
import { BaseRepository } from "../core/repositries/base-repositry";
import { RepositoryError } from "../core/utils/error-handler";
import logger from "../core/utils/logger";
import mentorExperienceModel from "../Models/mentor-experience-model";
import { IMentorExperience } from "../Interfaces/Models/i-mentor-experience";
import { StatusCodes } from "../enums/status-code-enums";
import { IMentorExperienceRepository } from "../Interfaces/Repository/i-mentor-experience-repository";
import { ClientSession } from "mongoose";

@injectable()
export class MentorExperienceRepository extends BaseRepository<IMentorExperience> implements IMentorExperienceRepository
{
  constructor() {
    super(mentorExperienceModel as Model<IMentorExperience>);
  }

  private toObjectId = (id?: string | Types.ObjectId): Types.ObjectId => {
    if (!id) {
      logger.warn("Missing ID when converting to ObjectId");
      throw new RepositoryError("Invalid ID: ID is required", StatusCodes.BAD_REQUEST);
    }

    let idStr: string;
    if (typeof id === "string") {
      idStr = id;
    } else if (id instanceof Types.ObjectId) {
      idStr = id.toString();
    } else {
      logger.warn(`Invalid ID type: ${typeof id}`);
      throw new RepositoryError(
        "Invalid ID: must be a string or ObjectId",
        StatusCodes.BAD_REQUEST
      );
    }

    if (!Types.ObjectId.isValid(idStr)) {
      logger.warn(`Invalid ObjectId format: ${idStr}`);
      throw new RepositoryError(
        "Invalid ID: must be a 24 character hex string",
        StatusCodes.BAD_REQUEST
      );
    }

    return new Types.ObjectId(idStr);
  };

  async createOne(data: Partial<IMentorExperience>, options?: { session?: ClientSession }): Promise<IMentorExperience> {
    try {
      logger.debug(`Creating mentor experience for mentorId: ${data.mentorId}`);
      const experience = await this.create({
        ...data,
        mentorId: this.toObjectId(data.mentorId),
      }, options?.session);
      logger.info(`Mentor experience created: ${experience._id}`);
      return experience;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating mentor experience for mentorId ${data.mentorId}`, err);
      throw new RepositoryError(
        "Failed to create mentor experience",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }


  async findByMentorId(mentorId: string): Promise<IMentorExperience[]> {
    try {
      logger.debug(`Fetching all experiences for mentorId: ${mentorId}`);
      const experiences = await this.model
        .find({ mentorId: this.toObjectId(mentorId) })
        .sort({ startDate: -1 })
        .exec();

      logger.info(`Found ${experiences.length} experiences for mentorId: ${mentorId}`);
      return experiences;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching experiences for mentorId ${mentorId}`, err);
      throw new RepositoryError(
        "Failed to find mentor experiences",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  async updateById(
    id: string,
    data: Partial<IMentorExperience>
  ): Promise<IMentorExperience | null> {
    try {
      logger.debug(`Updating mentor experience: ${id}`);
      const updated = await this.update(this.toObjectId(id).toString(), data);
      if (!updated) {
        logger.warn(`Mentor experience not found: ${id}`);
        throw new RepositoryError(
          `Mentor experience not found with ID: ${id}`,
          StatusCodes.NOT_FOUND
        );
      }
      logger.info(`Mentor experience updated: ${id}`);
      return updated;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating mentor experience ${id}`, err);
      throw new RepositoryError(
        "Failed to update mentor experience",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  async updateMany(
    filter: object,
    data: Partial<IMentorExperience>
  ): Promise<number> {
    try {
      logger.debug(`Updating multiple mentor experiences with filter: ${JSON.stringify(filter)}`);
      const result = await this.model.updateMany(filter, data).exec();
      logger.info(`Updated ${result.modifiedCount} mentor experiences`);
      return result.modifiedCount ?? 0;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error updating multiple mentor experiences", err);
      throw new RepositoryError(
        "Failed to update mentor experiences",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      logger.debug(`Deleting mentor experience: ${id}`);
      const deleted = await this.delete(this.toObjectId(id).toString());
      if (!deleted) {
        logger.warn(`Mentor experience not found for deletion: ${id}`);
      }
      logger.info(`Mentor experience deleted: ${id}`);
      return deleted;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting mentor experience ${id}`, err);
      throw new RepositoryError(
        "Failed to delete mentor experience",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

}