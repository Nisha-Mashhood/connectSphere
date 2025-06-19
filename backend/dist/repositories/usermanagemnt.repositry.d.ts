import { UserInterface } from "../Interfaces/models/IUser.js";
export declare const getAllUsers: () => Promise<UserInterface[]>;
export declare const getUserById: (id: string) => Promise<UserInterface | null>;
export declare const updateUserProfile: (id: string, data: Partial<UserInterface>) => Promise<UserInterface | null>;
export declare const blockUser: (id: string) => Promise<void>;
export declare const unblockUser: (id: string) => Promise<void>;
export declare const updateUserRole: (userId: string, role: string) => Promise<void>;
//# sourceMappingURL=usermanagemnt.repositry.d.ts.map