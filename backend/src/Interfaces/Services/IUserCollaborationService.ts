import { IUserConnection } from "../../Interfaces/Models/IUserConnection";
import { IContact } from "../../Interfaces/Models/IContact";

export interface IUserConnectionService {
  sendUserConnectionRequest: (requesterId: string, recipientId: string) => Promise<IUserConnection>;
  respondToConnectionRequest: (
    connectionId: string,
    action: "Accepted" | "Rejected"
  ) => Promise<{
    updatedConnection: IUserConnection;
    contacts?: IContact[];
  }>;
  disconnectConnection: (connectionId: string, reason: string) => Promise<IUserConnection | null>;
  fetchUserConnections: (userId: string) => Promise<IUserConnection[]>;
  fetchUserRequests: (userId: string) => Promise<{
    sentRequests: IUserConnection[];
    receivedRequests: IUserConnection[];
  }>;
  fetchAllUserConnections: () => Promise<IUserConnection[]>;
  fetchUserConnectionById: (connectionId: string) => Promise<IUserConnection | null>;
}