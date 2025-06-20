import { IBaseService } from '../Interfaces/IBaseService.js';
export declare abstract class BaseService implements IBaseService {
    checkData: (data: any) => void;
    throwError: (message: string) => never;
}
//# sourceMappingURL=BaseService.d.ts.map