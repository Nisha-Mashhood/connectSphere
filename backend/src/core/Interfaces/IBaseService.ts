export interface IBaseService {

  checkData(data: any): void;
  throwError(message: string): never;
  
}