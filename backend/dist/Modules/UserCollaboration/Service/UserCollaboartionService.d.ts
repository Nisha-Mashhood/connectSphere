import { BaseService } from '../../../core/Services/BaseService.js';
import { IUserConnection } from '../../../Interfaces/models/IUserConnection.js';
export declare class UserConnectionService extends BaseService {
    private userConnectionRepo;
    private contactRepo;
    constructor();
    sendUserConnectionRequest(requesterId: string, recipientId: string): Promise<IUserConnection>;
    respondToConnectionRequest(connectionId: string, action: 'Accepted' | 'Rejected'): Promise<any>;
    disconnectConnection(connectionId: string, reason: string): Promise<IUserConnection | null>;
    fetchUserConnections(userId: string): Promise<IUserConnection[]>;
    fetchUserRequests(userId: string): Promise<{
        sentRequests: IUserConnection[];
        receivedRequests: IUserConnection[];
    }>;
    fetchAllUserConnections(): Promise<IUserConnection[]>;
    fetchUserConnectionById(connectionId: string): Promise<IUserConnection | null>;
}
//# sourceMappingURL=UserCollaboartionService.d.ts.map