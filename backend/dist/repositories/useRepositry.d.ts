import { UserInterface } from '../models/user.js';
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
export declare const updateUser: (id: string, updateData: Partial<UserInterface>) => Promise<(import("mongoose").Document<unknown, {}, UserInterface> & UserInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
//# sourceMappingURL=useRepositry.d.ts.map