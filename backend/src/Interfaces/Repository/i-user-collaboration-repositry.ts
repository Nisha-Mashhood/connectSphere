import { IUserConnection } from '../Models/i-user-connection';

export interface IUserConnectionRepository {
  createUserConnection(requesterId: string, recipientId: string): Promise<IUserConnection>;
  updateUserConnectionStatus(connectionId: string, status: 'Accepted' | 'Rejected'): Promise<IUserConnection | null>;
  disconnectUserConnection(connectionId: string, reason: string): Promise<IUserConnection | null>;
  getUserConnections(userId: string): Promise<IUserConnection[]>;
  getUserRequests(userId: string): Promise<{ sentRequests: IUserConnection[]; receivedRequests: IUserConnection[] }>;
  getAllUserConnections(page: number, limit: number, search: string): Promise<{ connections: IUserConnection[]; total: number }>;
  getUserConnectionById(connectionId: string): Promise<IUserConnection | null>;
  findExistingConnection(requesterId: string, recipientId: string): Promise<IUserConnection | null>;
  getConnectionUserIds(connectionId: string): Promise<{ requester: string; recipient: string } | null>
}