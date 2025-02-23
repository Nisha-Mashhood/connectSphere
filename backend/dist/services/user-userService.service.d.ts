export declare const sendUserConnectionRequest: (requesterId: string, recipientId: string) => Promise<import("../models/userConnection.modal.js").IUserConnection>;
export declare const respondToConnectionRequest: (connectionId: string, action: "Accepted" | "Rejected") => Promise<import("../models/userConnection.modal.js").IUserConnection | null>;
export declare const disconnectConnection: (connectionId: string, reason: string) => Promise<import("../models/userConnection.modal.js").IUserConnection | null>;
export declare const fetchUserConnections: (userId: string) => Promise<import("../models/userConnection.modal.js").IUserConnection[]>;
export declare const fetchUserRequests: (userId: string) => Promise<{
    sentRequests: (import("mongoose").Document<unknown, {}, import("../models/userConnection.modal.js").IUserConnection> & import("../models/userConnection.modal.js").IUserConnection & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[];
    receivedRequests: (import("mongoose").Document<unknown, {}, import("../models/userConnection.modal.js").IUserConnection> & import("../models/userConnection.modal.js").IUserConnection & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[];
}>;
//# sourceMappingURL=user-userService.service.d.ts.map