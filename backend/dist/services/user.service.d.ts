export declare const getAllUsers: () => Promise<import("../models/user.model.js").UserInterface[]>;
export declare const getUserById: (id: string) => Promise<import("../models/user.model.js").UserInterface | null>;
export declare const updateUserProfile: (id: string, data: Partial<import("../models/user.model.js").UserInterface>) => Promise<import("../models/user.model.js").UserInterface | null>;
export declare const blockUser: (id: string) => Promise<void>;
export declare const unblockUser: (id: string) => Promise<void>;
export declare const changeRole: (Id: string, role: string) => Promise<void>;
//# sourceMappingURL=user.service.d.ts.map