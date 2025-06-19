import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { IUserConnection } from '../../../Interfaces/models/IUserConnection.js';
export declare class UserConnectionRepository extends BaseRepository<IUserConnection> {
    constructor();
    private toObjectId;
    createUserConnection(requesterId: string, recipientId: string): Promise<IUserConnection>;
    updateUserConnectionStatus(connectionId: string, status: 'Accepted' | 'Rejected'): Promise<IUserConnection | null>;
    disconnectUserConnection(connectionId: string, reason: string): Promise<IUserConnection | null>;
    getUserConnections(userId: string): Promise<IUserConnection[]>;
    getUserRequests(userId: string): Promise<{
        sentRequests: IUserConnection[];
        receivedRequests: IUserConnection[];
    }>;
    getAllUserConnections(): Promise<IUserConnection[]>;
    getUserConnectionById(connectionId: string): Promise<IUserConnection | null>;
    findExistingConnection(requesterId: string, recipientId: string): Promise<IUserConnection | null>;
}
//# sourceMappingURL=UserCollaborationRepositry.d.ts.map