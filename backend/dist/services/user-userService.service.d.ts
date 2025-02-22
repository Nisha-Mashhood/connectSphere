export declare const sendUserConnectionRequest: (requesterId: string, recipientId: string) => Promise<import("../models/userConnection.modal.js").IUserConnection>;
export declare const respondToConnectionRequest: (connectionId: string, action: "Accepted" | "Rejected") => Promise<import("../models/userConnection.modal.js").IUserConnection | null>;
export declare const disconnectConnection: (connectionId: string, reason: string) => Promise<import("../models/userConnection.modal.js").IUserConnection | null>;
export declare const fetchUserConnections: (userId: string) => Promise<import("../models/userConnection.modal.js").IUserConnection[]>;
//# sourceMappingURL=user-userService.service.d.ts.map