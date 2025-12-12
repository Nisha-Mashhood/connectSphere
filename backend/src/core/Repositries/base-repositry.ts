import { Model, Document, FilterQuery, UpdateQuery, ClientSession } from 'mongoose';
import { IBaseRepository } from '../interfaces/Ibase-repositry';
import logger from '../utils/logger';
import { RepositoryError } from '../utils/error-handler';
import { ERROR_MESSAGES } from '../../constants/error-messages';

// Base class for Basic DataBase Operations
export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected model: Model<T>;

  // Constructor for Initializing the Model
  constructor(model: Model<T>) {
    this.model = model;
    logger.debug(`Initialized repository for model: ${model.modelName}`);
  }

  // Create a new entity
  create = async (data: Partial<T>, session?: ClientSession): Promise<T> => {
    try {
    const entity = new this.model(data);
    const result = session
      ? await entity.save({ session })
      : await entity.save();

    logger.info(`Created entity in ${this.model.modelName}: ${result._id}`);
    return result;
  } catch (error: any) {
    logger.error(`Error creating entity in ${this.model.modelName}: ${error.message}`);
    throw new RepositoryError(
      `${ERROR_MESSAGES.FAILED_TO_CREATE_ENTITY} in ${this.model.modelName}`
    );
  }
  }

  // Find an entity by ID
  findById = async (id?: string): Promise<T | null> => {
    try {
      const result = await this.model.findById(id).exec();
      logger.debug(`Found entity in ${this.model.modelName} by ID: ${id}`);
      return result;
    } catch (error: any) {
      logger.error(`Error finding entity in ${this.model.modelName} by ID ${id}: ${error.message}`);
      throw new RepositoryError(`${ERROR_MESSAGES.FAILED_TO_FIND_ENTITY_BY_ID} ${id} in ${this.model.modelName}`);
    }
  }

  // Find one entity matching the query
  findOne = async (query: FilterQuery<T>): Promise<T | null> => {
    try {
      const result = await this.model.findOne(query).exec();
      logger.debug(`Found entity in ${this.model.modelName} with query: ${JSON.stringify(query)}`);
      return result;
    } catch (error: any) {
      logger.error(`Error finding entity in ${this.model.modelName} with query ${JSON.stringify(query)}: ${error.message}`);
      throw new RepositoryError(`${ERROR_MESSAGES.FAILED_TO_FIND_ENTITY} in ${this.model.modelName}`);
    }
  }

  // Find all entities
  findAll = async (): Promise<T[]> => {
    try {
      const result = await this.model.find().exec();
      logger.debug(`Retrieved ${result.length} entities from ${this.model.modelName}`);
      return result;
    } catch (error: any) {
      logger.error(`Error retrieving entities from ${this.model.modelName}: ${error.message}`);
      throw new RepositoryError(`${ERROR_MESSAGES.FAILED_TO_RETRIEVE_ENTITIES} from ${this.model.modelName}`);
    }
  }

  // Update an entity by ID
  update = async ( id: string, data: Partial<T>, session?: ClientSession ): Promise<T | null> => {
    try {
      const result = await this.model
        .findByIdAndUpdate(id, data, { new: true, session })
        .exec();
      logger.info(`Updated entity in ${this.model.modelName}: ${id}`);
      return result;
    } catch (error: any) {
      logger.error(
        `Error updating entity in ${this.model.modelName} with ID ${id}: ${error.message}`
      );
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_UPDATE_ENTITY} with ID ${id} in ${this.model.modelName}`
      );
    }
  };

  // Delete an entity by ID
  delete = async (id: string, session?: ClientSession): Promise<boolean> => {
    try {
      const result = await this.model
        .findByIdAndDelete(id, { session })
        .exec();
      logger.info(`Deleted entity in ${this.model.modelName}: ${id}`);
      return !!result;
    } catch (error: any) {
      logger.error(
        `Error deleting entity in ${this.model.modelName} with ID ${id}: ${error.message}`
      );
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_DELETE_ENTITY} with ID ${id} in ${this.model.modelName}`
      );
    }
  };

  // Update an entity by ID
  findByIdAndUpdate = async ( id: string, update: UpdateQuery<T>, options: { new?: boolean } = { new: true }, session?: ClientSession ): Promise<T | null> => {
    try {
      const result = await this.model
        .findByIdAndUpdate(id, update, { ...options, session })
        .exec();
      logger.info(`Updated entity in ${this.model.modelName} with ID ${id}`);
      return result;
    } catch (error: any) {
      logger.error(
        `Error updating entity in ${this.model.modelName} with ID ${id}: ${error.message}`
      );
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_UPDATE_ENTITY} with ID ${id} in ${this.model.modelName}`
      );
    }
  };

  // Delete an entity by ID
  findByIdAndDelete = async ( id: string, session?: ClientSession ): Promise<T | null> => {
    try {
      const result = await this.model
        .findByIdAndDelete(id, { session })
        .exec();
      logger.info(`Deleted entity in ${this.model.modelName}: ${id}`);
      return result;
    } catch (error: any) {
      logger.error(
        `Error deleting entity in ${this.model.modelName} with ID ${id}: ${error.message}`
      );
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_DELETE_ENTITY} with ID ${id} in ${this.model.modelName}`
      );
    }
  };
}