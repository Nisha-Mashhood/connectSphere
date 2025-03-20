import { Request, Response } from "express";
export declare const createCategory: (req: Request, res: Response) => Promise<void>;
export declare const getAllCategories: (_: Request, res: Response) => Promise<void>;
export declare const getCategoryById: (req: Request<{
    id: string;
}>, res: Response) => Promise<void>;
export declare const updateCategory: (req: Request<{
    id: string;
}>, res: Response) => Promise<void>;
export declare const deleteCategory: (req: Request<{
    id: string;
}>, res: Response) => Promise<void>;
//# sourceMappingURL=category.controller.d.ts.map