export interface IUserConnectionDTO {
  id: string;
  connectionId: string;
  requester: string;
  recipient: string;
  requestStatus: "Pending" | "Accepted" | "Rejected";
  connectionStatus: "Connected" | "Disconnected";
  requestSentAt: Date;
  requestAcceptedAt?: Date;
  disconnectedAt?: Date;
  disconnectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
