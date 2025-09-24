export interface IBaseRepository<T> {

  create(data: Partial<T>): Promise<T>;

  findById(id: string): Promise<T | null>;

  findOne(query: Partial<T>): Promise<T | null>;

  findAll(): Promise<T[]>;

  update(id: string, data: Partial<T>): Promise<T | null>;

  delete(id: string): Promise<boolean>;

  findByIdAndUpdate(id: string, update: Partial<T>, options?: { new?: boolean }): Promise<T | null>;

  findByIdAndDelete(id: string ): Promise<T | null>;
  
}