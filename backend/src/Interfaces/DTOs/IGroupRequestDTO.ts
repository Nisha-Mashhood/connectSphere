import { IGroupDTO } from "./IGroupDTO";
import { IUserDTO } from "./IUserDTO";

export interface IGroupRequestDTO {
  id: string;
  groupRequestId: string;
  groupId: string;
  group?: IGroupDTO;
  userId: string;
  user?: IUserDTO;
  status: "Pending" | "Accepted" | "Rejected";
  paymentStatus: "Pending" | "Completed" | "Failed";
  paymentId?: string;
  amountPaid?: number;
  createdAt: Date;
}
