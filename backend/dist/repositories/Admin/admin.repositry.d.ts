import { AdminInterface } from "../../models/admin.model.js";
export declare const createAdmin: (adminData: Partial<AdminInterface>) => Promise<import("mongoose").Document<unknown, {}, AdminInterface> & AdminInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const findAdminByEmail: (email: string) => Promise<(import("mongoose").Document<unknown, {}, AdminInterface> & AdminInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const findAdminrById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, AdminInterface> & AdminInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const findOrCreateAdmin: (profile: any, provider: string) => Promise<AdminInterface>;
export declare const updateAdmin: (id: string, updateData: Partial<AdminInterface>) => Promise<(import("mongoose").Document<unknown, {}, AdminInterface> & AdminInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const updatePassword: (id: string, password: string) => Promise<(import("mongoose").Document<unknown, {}, AdminInterface> & AdminInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const updateRefreshToken: (adminId: string, refreshToken: string) => Promise<(import("mongoose").Document<unknown, {}, AdminInterface> & AdminInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const removeRefreshToken: (adminemail: string) => Promise<void>;
//# sourceMappingURL=admin.repositry.d.ts.map