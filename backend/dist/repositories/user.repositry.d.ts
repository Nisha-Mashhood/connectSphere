import { UserInterface } from "../models/user.model.js";
export declare const createUser: (userData: Partial<UserInterface>) => Promise<import("mongoose").Document<unknown, {}, UserInterface> & UserInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const findUserByEmail: (email: string) => Promise<(import("mongoose").Document<unknown, {}, UserInterface> & UserInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const findUserById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, UserInterface> & UserInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const findOrCreateUser: (profile: any, provider: string) => Promise<UserInterface>;
export declare const updateUser: (id: string, updateData: Partial<UserInterface>) => Promise<(import("mongoose").Document<unknown, {}, UserInterface> & UserInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const updatePassword: (id: string, password: string) => Promise<(import("mongoose").Document<unknown, {}, UserInterface> & UserInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const updateRefreshToken: (userId: string, refreshToken: string) => Promise<(import("mongoose").Document<unknown, {}, UserInterface> & UserInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const removeRefreshToken: (useremail: string) => Promise<void>;
export declare const isProfileComplete: (user: UserInterface) => boolean;
//# sourceMappingURL=user.repositry.d.ts.map