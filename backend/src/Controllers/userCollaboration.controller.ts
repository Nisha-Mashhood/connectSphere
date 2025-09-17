import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import logger from '../Core/Utils/Logger';
import { IUserConnectionController } from '../Interfaces/Controller/IUserCollaborationController';
import { BaseController } from '../Core/Controller/BaseController';
import { IUserConnectionService } from '../Interfaces/Services/IUserCollaborationService';

@injectable()
export class UserConnectionController extends BaseController implements IUserConnectionController {
  private _userConnectionService: IUserConnectionService;

  constructor(@inject('IUserConnectionService') userConnectionServ : IUserConnectionService) {
    super();
    this._userConnectionService = userConnectionServ;
  }

   sendRequest  = async(req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      const { id: requesterId } = req.params;
      const { recipientId } = req.body;
      logger.debug(`Sending connection request: requester=${requesterId}, recipient=${recipientId}`);
      const newConnection = await this._userConnectionService.sendUserConnectionRequest(requesterId, recipientId);
      this.sendSuccess(res, newConnection, 'Connection request sent');
    } catch (error: any) {
      logger.error(`Error in sendRequest: ${error.message}`);
      next(error)
    }
  }

   respondToRequest  = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { connectionId } = req.params;
      const { action } = req.body;
      logger.debug(`Responding to connection request: connectionId=${connectionId}, action=${action}`);
      const result = await this._userConnectionService.respondToConnectionRequest(connectionId, action);
      this.sendSuccess(res, result, `Request ${action.toLowerCase()}`);
    } catch (error: any) {
      logger.error(`Error in respondToRequest: ${error.message}`);
      next(error)
    }
  }

   disconnectConnection  = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { connectionId } = req.params;
      const { reason } = req.body;
      logger.debug(`Disconnecting connection: connectionId=${connectionId}`);
      const disconnected = await this._userConnectionService.disconnectConnection(connectionId, reason);
      this.sendSuccess(res, disconnected, 'Connection disconnected');
      res.status(200).json({
        success: true,
        message: 'Connection disconnected',
        data: disconnected,
      });
    } catch (error: any) {
      logger.error(`Error in disconnectConnection: ${error.message}`);
      next(error)
    }
  }

   getUserConnections  = async(req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      logger.debug(`Fetching connections for user: ${userId}`);
      const connections = await this._userConnectionService.fetchUserConnections(userId);

      const data = connections.length === 0 ? [] : connections;
      const message = connections.length === 0 ? 'No connections found for this user' : 'Connections fetched';

      this.sendSuccess(res, data, message);

    } catch (error: any) {
      logger.error(`Error in getUserConnections: ${error.message}`);
      next(error)
    }
  }

   getUserRequests  = async(req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      logger.debug(`Fetching user requests for user: ${userId}`);
      const { sentRequests, receivedRequests } = await this._userConnectionService.fetchUserRequests(userId);

      const data = sentRequests.length === 0 && receivedRequests.length === 0 ? { sentRequests: [], receivedRequests: [] } : { sentRequests, receivedRequests };
      const message = sentRequests.length === 0 && receivedRequests.length === 0 ? 'No connections found for this user' : 'User requests fetched successfully';

      this.sendSuccess(res, data, message);

    } catch (error: any) {
      logger.error(`Error in getUserRequests: ${error.message}`);
      next(error)
    }
  }

   getAllUserConnections = async(_req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      logger.debug('Fetching all user connections');
      const connections = await this._userConnectionService.fetchAllUserConnections();

      const data = connections.length === 0 ? [] : connections;
      const message = connections.length === 0 ? 'No connections found' : 'All user connections fetched';

      this.sendSuccess(res, data, message);
    } catch (error: any) {
      logger.error(`Error in getAllUserConnections: ${error.message}`);
      next(error);
    }
  }

   getUserConnectionById  = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { connectionId } = req.params;
      logger.debug(`Fetching user connection by ID: ${connectionId}`);
      const connection = await this._userConnectionService.fetchUserConnectionById(connectionId);
      this.sendSuccess(res, connection, 'User connection fetched');
    } catch (error: any) {
      logger.error(`Error in getUserConnectionById: ${error.message}`);
      next(error)
    }
  }
}