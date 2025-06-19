import logger from '../Utils/Logger.js';
import { RepositoryError } from '../Utils/ErrorHandler.js';
//Base class for Basic DataBase Operations
export class BaseRepository {
    model;
    //Constructor for Initializing the Modal
    constructor(model) {
        this.model = model;
        logger.debug(`Initialized repository for model: ${model.modelName}`);
    }
    // Create a new entity
    async create(data) {
        try {
            const entity = new this.model(data);
            const result = await entity.save();
            logger.info(`Created entity in ${this.model.modelName}: ${result._id}`);
            return result;
        }
        catch (error) {
            logger.error(`Error creating entity in ${this.model.modelName}: ${error}`);
            throw new RepositoryError(`Failed to create entity in ${this.model.modelName}`);
        }
    }
    // Find an entity by ID
    async findById(id) {
        try {
            const result = await this.model.findById(id).exec();
            logger.debug(`Found entity in ${this.model.modelName} by ID: ${id}`);
            return result;
        }
        catch (error) {
            logger.error(`Error finding entity in ${this.model.modelName} by ID ${id}: ${error}`);
            throw new RepositoryError(`Failed to find entity by ID ${id} in ${this.model.modelName}`);
        }
    }
    // Find one entity matching the query
    async findOne(query) {
        try {
            const result = await this.model.findOne(query).exec();
            logger.debug(`Found entity in ${this.model.modelName} with query: ${JSON.stringify(query)}`);
            return result;
        }
        catch (error) {
            logger.error(`Error finding entity in ${this.model.modelName} with query ${JSON.stringify(query)}: ${error}`);
            throw new RepositoryError(`Failed to find entity with query in ${this.model.modelName}`);
        }
    }
    // Find all entities
    async findAll() {
        try {
            const result = await this.model.find().exec();
            logger.debug(`Retrieved ${result.length} entities from ${this.model.modelName}`);
            return result;
        }
        catch (error) {
            logger.error(`Error retrieving entities from ${this.model.modelName}: ${error}`);
            throw new RepositoryError(`Failed to retrieve entities from ${this.model.modelName}`);
        }
    }
    // Update an entity by ID
    async update(id, data) {
        try {
            const result = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
            logger.info(`Updated entity in ${this.model.modelName}: ${id}`);
            return result;
        }
        catch (error) {
            logger.error(`Error updating entity in ${this.model.modelName} with ID ${id}: ${error}`);
            throw new RepositoryError(`Failed to update entity with ID ${id} in ${this.model.modelName}`);
        }
    }
    // Delete an entity by ID
    async delete(id) {
        try {
            const result = await this.model.findByIdAndDelete(id).exec();
            logger.info(`Deleted entity in ${this.model.modelName}: ${id}`);
            return !!result;
        }
        catch (error) {
            logger.error(`Error deleting entity in ${this.model.modelName} with ID ${id}: ${error}`);
            throw new RepositoryError(`Failed to delete entity with ID ${id} in ${this.model.modelName}`);
        }
    }
    // Update an entity by ID 
    async findByIdAndUpdate(id, update, options = { new: true }) {
        try {
            const result = await this.model.findByIdAndUpdate(id, update, options).exec();
            logger.info(`Updated entity in ${this.model.modelName} with ID ${id}`);
            return result;
        }
        catch (error) {
            logger.error(`Error updating entity in ${this.model.modelName} with ID ${id}: ${error}`);
            throw new RepositoryError(`Failed to update entity with ID ${id} in ${this.model.modelName}`);
        }
    }
    //Delete an entity by Id
    async findByIdAndDelete(id) {
        try {
            const result = await this.model.findByIdAndDelete(id).exec();
            logger.info(`Deleted entity in ${this.model.modelName}: ${id}`);
            return result;
        }
        catch (error) {
            logger.error(`Error deleting entity in ${this.model.modelName} with ID ${id}: ${error}`);
            throw new RepositoryError(`Failed to delete entity with ID ${id} in ${this.model.modelName}`);
        }
    }
}
//# sourceMappingURL=BaseRepositry.js.map