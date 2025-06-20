import { Model, Document, FilterQuery } from 'mongoose';
import { IBaseRepository } from '../Interfaces/IBaseRepositry.js';
export declare abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
    protected model: Model<T>;
    constructor(model: Model<T>);
    create: (data: Partial<T>) => Promise<T>;
    findById: (id?: string) => Promise<T | null>;
    findOne: (query: FilterQuery<T>) => Promise<T | null>;
    findAll: () => Promise<T[]>;
    update: (id: string, data: Partial<T>) => Promise<T | null>;
    delete: (id: string) => Promise<boolean>;
    findByIdAndUpdate: (id: string, update: any, options?: {
        new?: boolean;
    }) => Promise<T | null>;
    findByIdAndDelete: (id: string) => Promise<T | null>;
}
//# sourceMappingURL=BaseRepositry.d.ts.map