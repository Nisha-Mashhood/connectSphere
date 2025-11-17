import { inject, injectable } from "inversify";
import { ServiceError } from "../core/utils/error-handler";
import logger from "../core/utils/logger";
import { StatusCodes } from "../enums/status-code-enums";
import { IContact } from "../Interfaces/Models/i-contact";
import { IUserConnectionRepository } from "../Interfaces/Repository/i-user-collaboration-repositry";
import { IContactRepository } from "../Interfaces/Repository/i-contact-repositry";
import { toUserConnectionDTO, toUserConnectionDTOs } from "../Utils/mappers/user-connection-mapper";
import { IUserConnectionDTO } from "../Interfaces/DTOs/i-user-connection-dto";
import { IUserConnectionService } from "../Interfaces/Services/i-user-collaboration-service";

@injectable()
export class UserConnectionService implements IUserConnectionService{
  private _userConnectionRepository: IUserConnectionRepository;
  private _contactRepository: IContactRepository;

  constructor(
    @inject('IUserConnectionRepository') userConnectionRepository : IUserConnectionRepository,
    @inject('IContactRepository') contactRepository : IContactRepository
  ) {
    this._userConnectionRepository = userConnectionRepository;
    this._contactRepository = contactRepository;
  }

  public sendUserConnectionRequest = async (
    requesterId: string,
    recipientId: string
  ): Promise<IUserConnectionDTO> => {
    try {
      logger.debug(
        `Sending connection request: requester=${requesterId}, recipient=${recipientId}`
      );
      if (requesterId === recipientId) {
        logger.error("Attempt to send connection request to self");
        throw new ServiceError(
          "You cannot send a connection request to yourself",
          StatusCodes.BAD_REQUEST
        );
      }

      const existingConnection =
        await this._userConnectionRepository.findExistingConnection(
          requesterId,
          recipientId
        );
      if (existingConnection) {
        logger.error(
          `Pending request already exists: requester=${requesterId}, recipient=${recipientId}`
        );
        throw new ServiceError(
          "A pending request already exists for this user",
          StatusCodes.BAD_REQUEST
        );
      }

      const connection = await this._userConnectionRepository.createUserConnection(
        requesterId,
        recipientId
      );
      const connectionDTO = toUserConnectionDTO(connection);
      if (!connectionDTO) {
        logger.error(`Failed to map user connection ${connection._id} to DTO`);
        throw new ServiceError("Failed to map user connection to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }
      logger.info(
        `Connection request created: ${connection._id} (requester=${requesterId}, recipient=${recipientId})`
      );
      return connectionDTO;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error sending connection request from ${requesterId} to ${recipientId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to send connection request",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public respondToConnectionRequest = async (
    connectionId: string,
    action: "Accepted" | "Rejected"
  ): Promise<{ updatedConnection: IUserConnectionDTO; contacts?: IContact[] }> => {
    try {
      logger.debug(
        `Responding to connection request: connectionId=${connectionId}, action=${action}`
      );
      const validActions = ["Accepted", "Rejected"];
      if (!validActions.includes(action)) {
        logger.error(`Invalid action: ${action}`);
        throw new ServiceError(
          `Action must be one of: ${validActions.join(", ")}`,
          StatusCodes.BAD_REQUEST
        );
      }

      const updatedConnection =
        await this._userConnectionRepository.updateUserConnectionStatus(
          connectionId,
          action
        );
      if (!updatedConnection) {
        logger.error(`Connection not found: ${connectionId}`);
        throw new ServiceError("Connection not found", StatusCodes.NOT_FOUND);
      }

      const updatedConnectionDTO = toUserConnectionDTO(updatedConnection);
      if (!updatedConnectionDTO) {
        logger.error(`Failed to map user connection ${updatedConnection._id} to DTO`);
        throw new ServiceError("Failed to map user connection to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      if (action === "Accepted") {
        const requesterId = updatedConnection.requester.toString();
        const recipientId = updatedConnection.recipient.toString();
        const [contact1, contact2] = await Promise.all([
          this._contactRepository.createContact({
            userId: requesterId,
            targetUserId: recipientId,
            userConnectionId: connectionId,
            type: "user-user",
          }),
          this._contactRepository.createContact({
            userId: recipientId,
            targetUserId: requesterId,
            userConnectionId: connectionId,
            type: "user-user",
          }),
        ]);
        logger.info(`Contacts created for connection: ${connectionId}`);
        return { updatedConnection: updatedConnectionDTO, contacts: [contact1, contact2] };
      }

      logger.info(`Connection request ${connectionId} ${action.toLowerCase()}`);
      return { updatedConnection: updatedConnectionDTO };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error responding to connection request ${connectionId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to respond to connection request",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public disconnectConnection = async (
    connectionId: string,
    reason: string
  ): Promise<IUserConnectionDTO | null> => {
    try {
      logger.debug(`Disconnecting connection: connectionId=${connectionId}`);
      if (!reason || reason.trim() === "") {
        logger.error("Reason is required for disconnection");
        throw new ServiceError("Reason is required", StatusCodes.BAD_REQUEST);
      }

      const updatedConnection =
        await this._userConnectionRepository.disconnectUserConnection(
          connectionId,
          reason
        );
      if (!updatedConnection) {
        logger.error(`Connection not found: ${connectionId}`);
        throw new ServiceError("Connection not found", StatusCodes.NOT_FOUND);
      }

      const updatedConnectionDTO = toUserConnectionDTO(updatedConnection);
      if (!updatedConnectionDTO) {
        logger.error(`Failed to map user connection ${updatedConnection._id} to DTO`);
        throw new ServiceError("Failed to map user connection to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      await this._contactRepository.deleteContact(connectionId, "user-user");
      logger.info(
        `Connection ${connectionId} disconnected and associated contacts deleted`
      );
      return updatedConnectionDTO;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error disconnecting connection ${connectionId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to disconnect connection",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public fetchUserConnections = async (
    userId: string
  ): Promise<IUserConnectionDTO[]> => {
    try {
      logger.debug(`Fetching connections for user: ${userId}`);
      const connections = await this._userConnectionRepository.getUserConnections(
        userId
      );
      const connectionDTOs = toUserConnectionDTOs(connections);
      logger.info(
        `Fetched ${connectionDTOs.length} connections for user: ${userId}`
      );
      return connectionDTOs;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error fetching connections for user ${userId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch user connections",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public fetchUserRequests = async (
    userId: string
  ): Promise<{
    sentRequests: IUserConnectionDTO[];
    receivedRequests: IUserConnectionDTO[];
  }> => {
    try {
      logger.debug(`Fetching user requests for user: ${userId}`);
      const requests = await this._userConnectionRepository.getUserRequests(userId);
      const sentRequestDTOs = toUserConnectionDTOs(requests.sentRequests);
      const receivedRequestDTOs = toUserConnectionDTOs(requests.receivedRequests);
      logger.info(
        `Fetched ${sentRequestDTOs.length} sent and ${receivedRequestDTOs.length} received requests for user: ${userId}`
      );
      return { sentRequests: sentRequestDTOs, receivedRequests: receivedRequestDTOs };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error fetching user requests for user ${userId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch user requests",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };


  public fetchAllUserConnections = async (
  page: number,
  limit: number,
  search: string
): Promise<{ connections: IUserConnectionDTO[]; total: number }> => {
  try {
    logger.debug(`Service – page:${page} limit:${limit} search:"${search}"`);
    const { connections, total } =
      await this._userConnectionRepository.getAllUserConnections(
        page,
        limit,
        search
      );

    const connectionDTOs = toUserConnectionDTOs(connections);
    return { connections: connectionDTOs, total };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error fetching paginated connections: ${err.message}`);
    throw error instanceof ServiceError
      ? error
      : new ServiceError(
          'Failed to fetch paginated connections',
          StatusCodes.INTERNAL_SERVER_ERROR,
          err
        );
  }
};

  public fetchUserConnectionById = async (
    connectionId: string
  ): Promise<IUserConnectionDTO | null> => {
    try {
      logger.debug(`Fetching user connection by ID: ${connectionId}`);
      const connection = await this._userConnectionRepository.getUserConnectionById(
        connectionId
      );
      if (!connection) {
        logger.warn(`Connection not found: ${connectionId}`);
        throw new ServiceError("Connection not found", StatusCodes.NOT_FOUND);
      }

      const connectionDTO = toUserConnectionDTO(connection);
      if (!connectionDTO) {
        logger.error(`Failed to map user connection ${connection._id} to DTO`);
        throw new ServiceError("Failed to map user connection to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      logger.info(`Fetched connection: ${connectionId}`);
      return connectionDTO;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching connection ${connectionId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch user connection",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };
}
