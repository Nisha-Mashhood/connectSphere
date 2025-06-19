import { IUserConnection } from "../Interfaces/models/IUserConnection.js";
export declare const createUserConnection: (requesterId: string, recipientId: string) => Promise<IUserConnection>;
export declare const updateUserConnectionStatus: (connectionId: string, status: "Accepted" | "Rejected") => Promise<IUserConnection | null>;
export declare const disconnectUserConnection: (connectionId: string, reason: string) => Promise<IUserConnection | null>;
export declare const getUserConnections: (userId: string) => Promise<IUserConnection[]>;
export declare const getUserRequests: (userId: string) => Promise<{
    sentRequests: (import("mongoose").Document<unknown, {}, IUserConnection> & IUserConnection & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[];
    receivedRequests: (import("mongoose").Document<unknown, {}, IUserConnection> & IUserConnection & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[];
}>;
export declare const getAllUserConnections: () => Promise<IUserConnection[]>;
export declare const getUserConnectionWithId: (connectionId: string) => Promise<IUserConnection>;
//# sourceMappingURL=user-userRepo.repositry.d.ts.map