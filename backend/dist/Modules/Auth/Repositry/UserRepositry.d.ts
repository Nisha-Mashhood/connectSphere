import { UserInterface } from "../../../Interfaces/models/IUser.js";
import { BaseRepository } from "../../../core/Repositries/BaseRepositry.js";
export declare class UserRepository extends BaseRepository<UserInterface> {
    constructor();
    createUser(userData: Partial<UserInterface>): Promise<UserInterface>;
    findUserByEmail(email: string): Promise<UserInterface | null>;
    getUserById(id: string): Promise<UserInterface | null>;
    findOrCreateUser(profile: {
        email: string;
        displayName?: string;
        id?: string;
        photos?: {
            value: string;
        }[];
    }, provider: string): Promise<UserInterface>;
    updatePassword(id: string, password: string): Promise<UserInterface | null>;
    incrementLoginCount(userId: string): Promise<UserInterface | null>;
    updateRefreshToken(userId: string, refreshToken: string): Promise<UserInterface | null>;
    removeRefreshToken(email: string): Promise<void>;
    isProfileComplete(user: UserInterface): Promise<boolean>;
    getAllUsers(): Promise<UserInterface[]>;
    updateUserProfile(id: string, data: Partial<UserInterface>): Promise<UserInterface | null>;
    blockUser(id: string): Promise<void>;
    unblockUser(id: string): Promise<void>;
    updateUserRole(userId: string, role: string): Promise<UserInterface | null>;
}
//# sourceMappingURL=UserRepositry.d.ts.map