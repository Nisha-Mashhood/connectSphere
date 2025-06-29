import { IUserConnection } from "../Interfaces/models/IUserConnection.js";
export declare const sendUserConnectionRequest: (requesterId: string, recipientId: string) => Promise<IUserConnection>;
export declare const respondToConnectionRequest: (connectionId: string, action: "Accepted" | "Rejected") => Promise<IUserConnection | {
    updatedConnection: IUserConnection;
    contacts: import("../Interfaces/models/IContact.js").IContact[];
}>;
export declare const disconnectConnection: (connectionId: string, reason: string) => Promise<IUserConnection | null>;
export declare const fetchUserConnections: (userId: string) => Promise<IUserConnection[]>;
export declare const fetchUserRequests: (userId: string) => Promise<{
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
export declare const fetchAllUserConnections: () => Promise<IUserConnection[]>;
export declare const fetchUserConnectionById: (connectionId: string) => Promise<IUserConnection>;
//# sourceMappingURL=user-userService.service.d.ts.map