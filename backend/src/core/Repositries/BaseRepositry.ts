import { Model, Document, FilterQuery } from 'mongoose';
import { IBaseRepository } from '../Interfaces/IBaseRepositry.js'; 
import logger from '../Utils/Logger.js'; 
import { RepositoryError } from '../Utils/ErrorHandler.js'; 

//Base class for Basic DataBase Operations
export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected model: Model<T>;

  //Constructor for Initializing the Modal
  constructor(model: Model<T>) {
    this.model = model;
    logger.debug(`Initialized repository for model: ${model.modelName}`);
  }

  // Create a new entity
  create = async(data: Partial<T>): Promise<T> => {
    try {
      const entity = new this.model(data);
      const result = await entity.save();
      logger.info(`Created entity in ${this.model.modelName}: ${result._id}`);
      return result;
    } catch (error) {
      logger.error(`Error creating entity in ${this.model.modelName}: ${error}`);
      throw new RepositoryError(`Failed to create entity in ${this.model.modelName}`);
    }
  }

  // Find an entity by ID
  findById = async(id?: string): Promise<T | null> => {
    try {
      const result = await this.model.findById(id).exec();
      logger.debug(`Found entity in ${this.model.modelName} by ID: ${id}`);
      return result;
    } catch (error) {
      logger.error(`Error finding entity in ${this.model.modelName} by ID ${id}: ${error}`);
      throw new RepositoryError(`Failed to find entity by ID ${id} in ${this.model.modelName}`);
    }
  }

  // Find one entity matching the query
  findOne = async(query: FilterQuery<T>): Promise<T | null> => {
    try {
      const result = await this.model.findOne(query).exec();
      logger.debug(`Found entity in ${this.model.modelName} with query: ${JSON.stringify(query)}`);
      return result;
    } catch (error) {
      logger.error(`Error finding entity in ${this.model.modelName} with query ${JSON.stringify(query)}: ${error}`);
      throw new RepositoryError(`Failed to find entity with query in ${this.model.modelName}`);
    }
  }

  // Find all entities
  findAll = async(): Promise<T[]> => {
    try {
      const result = await this.model.find().exec();
      logger.debug(`Retrieved ${result.length} entities from ${this.model.modelName}`);
      return result;
    } catch (error) {
      logger.error(`Error retrieving entities from ${this.model.modelName}: ${error}`);
      throw new RepositoryError(`Failed to retrieve entities from ${this.model.modelName}`);
    }
  }

  // Update an entity by ID
  update = async(id: string, data: Partial<T>): Promise<T | null> => {
    try {
      const result = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
      logger.info(`Updated entity in ${this.model.modelName}: ${id}`);
      return result;
    } catch (error) {
      logger.error(`Error updating entity in ${this.model.modelName} with ID ${id}: ${error}`);
      throw new RepositoryError(`Failed to update entity with ID ${id} in ${this.model.modelName}`);
    }
  }

  // Delete an entity by ID
  delete = async(id: string): Promise<boolean> => {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      logger.info(`Deleted entity in ${this.model.modelName}: ${id}`);
      return !!result;
    } catch (error) {
      logger.error(`Error deleting entity in ${this.model.modelName} with ID ${id}: ${error}`);
      throw new RepositoryError(`Failed to delete entity with ID ${id} in ${this.model.modelName}`);
    }
  }

  // Update an entity by ID 
  findByIdAndUpdate = async (id: string, update: any, options: { new?: boolean } = { new: true }): Promise<T | null> => {
    try {
      const result = await this.model.findByIdAndUpdate(id, update, options).exec();
      logger.info(`Updated entity in ${this.model.modelName} with ID ${id}`);
      return result;
    } catch (error) {
      logger.error(`Error updating entity in ${this.model.modelName} with ID ${id}: ${error}`);
      throw new RepositoryError(`Failed to update entity with ID ${id} in ${this.model.modelName}`);
    }
  }

  //Delete an entity by Id
  findByIdAndDelete = async(id: string): Promise<T | null> => {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      logger.info(`Deleted entity in ${this.model.modelName}: ${id}`);
      return result;
    } catch (error) {
      logger.error(`Error deleting entity in ${this.model.modelName} with ID ${id}: ${error}`);
      throw new RepositoryError(`Failed to delete entity with ID ${id} in ${this.model.modelName}`);
    }
  }
}