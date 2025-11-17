import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import logger from '../core/utils/logger';
import { IUserConnectionController } from '../Interfaces/Controller/i-user-collaboration-controller';
import { BaseController } from '../core/controller/base-controller';
import { IUserConnectionService } from '../Interfaces/Services/i-user-collaboration-service';
import { USER_CONNECTION_MESSAGES } from '../constants/messages';

@injectable()
export class UserConnectionController extends BaseController implements IUserConnectionController {
  private _userConnectionService: IUserConnectionService;

  constructor(@inject('IUserConnectionService') userConnectionServ : IUserConnectionService) {
    super();
    this._userConnectionService = userConnectionServ;
  }

   sendRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: requesterId } = req.params;
      const { recipientId } = req.body;
      logger.debug(`Sending connection request: requester=${requesterId}, recipient=${recipientId}`);
      const newConnection = await this._userConnectionService.sendUserConnectionRequest(requesterId, recipientId);
      this.sendSuccess(res, newConnection, USER_CONNECTION_MESSAGES.CONNECTION_REQUEST_SENT);
    } catch (error: any) {
      logger.error(`Error in sendRequest: ${error.message}`);
      next(error);
    }
  };

  respondToRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { connectionId } = req.params;
      const { action } = req.body;
      logger.debug(`Responding to connection request: connectionId=${connectionId}, action=${action}`);
      const result = await this._userConnectionService.respondToConnectionRequest(connectionId, action);
      const message =
        action.toLowerCase() === "accepted"
          ? USER_CONNECTION_MESSAGES.REQUEST_ACCEPTED
          : USER_CONNECTION_MESSAGES.REQUEST_REJECTED;
      this.sendSuccess(res, result, message);
    } catch (error: any) {
      logger.error(`Error in respondToRequest: ${error.message}`);
      next(error);
    }
  };

  disconnectConnection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { connectionId } = req.params;
      const { disconnectionReason } = req.body;
      const disconnected = await this._userConnectionService.disconnectConnection(connectionId, disconnectionReason);
      this.sendSuccess(res, disconnected, USER_CONNECTION_MESSAGES.CONNECTION_DISCONNECTED);
      res.status(200).json({
        success: true,
        message: USER_CONNECTION_MESSAGES.CONNECTION_DISCONNECTED,
        data: disconnected,
      });
    } catch (error: any) {
      logger.error(`Error in disconnectConnection: ${error.message}`);
      next(error);
    }
  };

  getUserConnections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      logger.debug(`Fetching connections for user: ${userId}`);
      const connections = await this._userConnectionService.fetchUserConnections(userId);

      const data = connections.length === 0 ? [] : connections;
      const message = connections.length === 0 ? USER_CONNECTION_MESSAGES.NO_CONNECTIONS_FOUND_FOR_USER : USER_CONNECTION_MESSAGES.CONNECTIONS_FETCHED;

      this.sendSuccess(res, data, message);
    } catch (error: any) {
      logger.error(`Error in getUserConnections: ${error.message}`);
      next(error);
    }
  };

  getUserRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      logger.debug(`Fetching user requests for user: ${userId}`);
      const { sentRequests, receivedRequests } = await this._userConnectionService.fetchUserRequests(userId);

      const data = sentRequests.length === 0 && receivedRequests.length === 0 ? { sentRequests: [], receivedRequests: [] } : { sentRequests, receivedRequests };
      const message =
        sentRequests.length === 0 && receivedRequests.length === 0
          ? USER_CONNECTION_MESSAGES.NO_CONNECTIONS_FOUND_FOR_USER
          : USER_CONNECTION_MESSAGES.USER_REQUESTS_FETCHED;

      this.sendSuccess(res, data, message);
    } catch (error: any) {
      logger.error(`Error in getUserRequests: ${error.message}`);
      next(error);
    }
  };

  getAllUserConnections = async ( req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 12;
    const search = (req.query.search as string) || '';

    const { connections, total } =
      await this._userConnectionService.fetchAllUserConnections( page, limit, search );
      const data = connections.length === 0 ? [] : connections;

    this.sendSuccess(res, { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
     });
  } catch (error: any) {
    logger.error(`Error in getAllUserConnectionsPaginated: ${error.message}`);
    next(error);
  }
};

  getUserConnectionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { connectionId } = req.params;
      logger.debug(`Fetching user connection by ID: ${connectionId}`);
      const connection = await this._userConnectionService.fetchUserConnectionById(connectionId);
      this.sendSuccess(res, connection, USER_CONNECTION_MESSAGES.USER_CONNECTION_FETCHED);
    } catch (error: any) {
      logger.error(`Error in getUserConnectionById: ${error.message}`);
      next(error);
    }
  };
}