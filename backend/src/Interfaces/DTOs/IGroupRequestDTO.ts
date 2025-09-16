export interface IGroupRequestDTO {
  id: string;
  groupRequestId: string;
  groupId: string;
  userId: string;
  status: "Pending" | "Accepted" | "Rejected";
  paymentStatus: "Pending" | "Completed" | "Failed";
  paymentId?: string;
  amountPaid?: number;
  createdAt: Date;
}
