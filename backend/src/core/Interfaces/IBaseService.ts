export interface IBaseService {

  validateData(data: any): Promise<void>;
  
}