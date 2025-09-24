import { IGroupDTO } from "./i-group-dto";
import { IUserDTO } from "./i-user-dto";

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
