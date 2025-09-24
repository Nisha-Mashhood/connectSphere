import { IUserDTO } from "./i-user-dto";

export interface IUserConnectionDTO {
  id: string;
  connectionId: string;
  requesterId: string;
  requester?: IUserDTO; // Populated requester details when available
  recipientId: string;
  recipient?: IUserDTO; // Populated recipient details when available
  requestStatus: "Pending" | "Accepted" | "Rejected";
  connectionStatus: "Connected" | "Disconnected";
  requestSentAt: Date;
  requestAcceptedAt?: Date;
  disconnectedAt?: Date;
  disconnectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}