import { inject, injectable } from "inversify";
import { ServiceError } from "../Core/Utils/ErrorHandler";
import logger from "../Core/Utils/Logger";
import { IUserConnection } from "../Interfaces/Models/IUserConnection";
import { StatusCodes } from "../Constants/StatusCode.constants";
import { IContact } from "../Interfaces/Models/IContact";
import { IUserConnectionRepository } from "../Interfaces/Repository/IUserCollaborationRepository";
import { IContactRepository } from "../Interfaces/Repository/IContactRepository";

@injectable()
export class UserConnectionService {
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
  ): Promise<IUserConnection> => {
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
      logger.info(
        `Connection request created: ${connection._id} (requester=${requesterId}, recipient=${recipientId})`
      );
      return connection;
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
  ): Promise<{ updatedConnection: IUserConnection; contacts?: IContact[] }> => {
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
        return { updatedConnection, contacts: [contact1, contact2] };
      }

      logger.info(`Connection request ${connectionId} ${action.toLowerCase()}`);
      return { updatedConnection };
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
  ): Promise<IUserConnection | null> => {
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

      await this._contactRepository.deleteContact(connectionId, "user-user");
      logger.info(
        `Connection ${connectionId} disconnected and associated contacts deleted`
      );
      return updatedConnection;
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
  ): Promise<IUserConnection[]> => {
    try {
      logger.debug(`Fetching connections for user: ${userId}`);
      const connections = await this._userConnectionRepository.getUserConnections(
        userId
      );
      logger.info(
        `Fetched ${connections.length} connections for user: ${userId}`
      );
      return connections;
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
    sentRequests: IUserConnection[];
    receivedRequests: IUserConnection[];
  }> => {
    try {
      logger.debug(`Fetching user requests for user: ${userId}`);
      const requests = await this._userConnectionRepository.getUserRequests(userId);
      logger.info(
        `Fetched ${requests.sentRequests.length} sent and ${requests.receivedRequests.length} received requests for user: ${userId}`
      );
      return requests;
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

  public fetchAllUserConnections = async (): Promise<IUserConnection[]> => {
    try {
      logger.debug("Fetching all user connections");
      const connections = await this._userConnectionRepository.getAllUserConnections();
      logger.info(`Fetched ${connections.length} user connections`);
      return connections;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching all user connections: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch all user connections",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public fetchUserConnectionById = async (
    connectionId: string
  ): Promise<IUserConnection | null> => {
    try {
      logger.debug(`Fetching user connection by ID: ${connectionId}`);
      const connection = await this._userConnectionRepository.getUserConnectionById(
        connectionId
      );
      if (!connection) {
        logger.warn(`Connection not found: ${connectionId}`);
        throw new ServiceError("Connection not found", StatusCodes.NOT_FOUND);
      }

      logger.info(`Fetched connection: ${connectionId}`);
      return connection;
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
