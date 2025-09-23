import { IContact } from "../../Interfaces/Models/IContact";
import { IUserConnectionDTO } from "../DTOs/IUserConnectionDTO";

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
  fetchAllUserConnections: () => Promise<IUserConnectionDTO[]>;
  fetchUserConnectionById: (connectionId: string) => Promise<IUserConnectionDTO | null>;
}