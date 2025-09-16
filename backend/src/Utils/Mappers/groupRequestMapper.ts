import { IGroupRequest } from '../../Interfaces/Models/IGroupRequest';
import { IGroupRequestDTO } from '../../Interfaces/DTOs/IGroupRequestDTO';

export function toGroupRequestDTO(request: IGroupRequest | null): IGroupRequestDTO | null {
  if (!request) return null;

  return {
    id: request._id.toString(),
    groupRequestId: request.groupRequestId,
    groupId: request.groupId.toString(),
    userId: request.userId.toString(),
    status: request.status,
    paymentStatus: request.paymentStatus,
    paymentId: request.paymentId,
    amountPaid: request.amountPaid,
    createdAt: request.createdAt,
  };
}

export function toGroupRequestDTOs(requests: IGroupRequest[]): IGroupRequestDTO[] {
  return requests.map(toGroupRequestDTO).filter((dto): dto is IGroupRequestDTO => dto !== null);
}
