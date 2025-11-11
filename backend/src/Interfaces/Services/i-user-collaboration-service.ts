import { IContact } from "../Models/i-contact";
import { IUserConnectionDTO } from "../DTOs/i-user-connection-dto";

export interface IUserConnectionService {
  sendUserConnectionRequest: (requesterId: string, recipientId: string) => Promise<IUserConnectionDTO>;
  respondToConnectionRequest: (
    connectionId: string,
    action: "Accepted" | "Rejected"
  ) => Promise<{
    updatedConnection: IUserConnectionDTO;
    contacts?: IContact[];
  }>;
  disconnectConnection: (connectionId: string, reason: string) => Promise<IUserConnectionDTO | null>;
  fetchUserConnections: (userId: string) => Promise<IUserConnectionDTO[]>;
  fetchUserRequests: (userId: string) => Promise<{
    sentRequests: IUserConnectionDTO[];
    receivedRequests: IUserConnectionDTO[];
  }>;
  fetchAllUserConnections: ( page: number, limit: number, search: string) => Promise<{ connections: IUserConnectionDTO[]; total: number }>;
  fetchUserConnectionById: (connectionId: string) => Promise<IUserConnectionDTO | null>;
}