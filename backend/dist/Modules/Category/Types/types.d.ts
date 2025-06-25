import { Request } from 'express';
import { CategoryInterface as ICategory } from "../../../Interfaces/models/CategoryInterface.js";
export interface CategoryRequest extends Request {
    body: Partial<ICategory>;
    params: {
        id?: string;
    };
}
//# sourceMappingURL=types.d.ts.map