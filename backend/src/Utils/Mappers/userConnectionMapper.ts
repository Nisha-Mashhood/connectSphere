import { IUserConnection } from '../../Interfaces/Models/IUserConnection';
import { IUserConnectionDTO } from '../../Interfaces/DTOs/IUserConnectionDTO';

export function toUserConnectionDTO(connection: IUserConnection | null): IUserConnectionDTO | null {
  if (!connection) return null;

  return {
    id: connection._id.toString(),
    connectionId: connection.connectionId,
    requester: typeof connection.requester === 'string' ? connection.requester : connection.requester._id.toString(),
    recipient: typeof connection.recipient === 'string' ? connection.recipient : connection.recipient._id.toString(),
    requestStatus: connection.requestStatus,
    connectionStatus: connection.connectionStatus,
    requestSentAt: connection.requestSentAt,
    requestAcceptedAt: connection.requestAcceptedAt,
    disconnectedAt: connection.disconnectedAt,
    disconnectionReason: connection.disconnectionReason,
    createdAt: connection.createdAt,
    updatedAt: connection.updatedAt,
  };
}

export function toUserConnectionDTOs(connections: IUserConnection[]): IUserConnectionDTO[] {
  return connections.map(toUserConnectionDTO).filter((dto): dto is IUserConnectionDTO => dto !== null);
}
