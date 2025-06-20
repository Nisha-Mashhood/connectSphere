import { Request, Response } from 'express';
import { UserConnectionService } from '../Service/UserCollaboartionService.js';
import logger from '../../../core/Utils/Logger.js';

export class UserConnectionController {
  private userConnectionService: UserConnectionService;

  constructor() {
    this.userConnectionService = new UserConnectionService();
  }

   sendRequest  = async(req: Request, res: Response): Promise<void> => {
    try {
      const { id: requesterId } = req.params;
      const { recipientId } = req.body;
      logger.debug(`Sending connection request: requester=${requesterId}, recipient=${recipientId}`);
      const newConnection = await this.userConnectionService.sendUserConnectionRequest(requesterId, recipientId);
      res.status(201).json({
        success: true,
        message: 'Connection request sent',
        data: newConnection,
      });
    } catch (error: any) {
      logger.error(`Error in sendRequest: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to send connection request',
      });
    }
  }

   respondToRequest  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { connectionId } = req.params;
      const { action } = req.body;
      logger.debug(`Responding to connection request: connectionId=${connectionId}, action=${action}`);
      const result = await this.userConnectionService.respondToConnectionRequest(connectionId, action);
      res.status(200).json({
        success: true,
        message: `Request ${action.toLowerCase()}`,
        data: result,
      });
    } catch (error: any) {
      logger.error(`Error in respondToRequest: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to respond to connection request',
      });
    }
  }

   disconnectConnection  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { connectionId } = req.params;
      const { reason } = req.body;
      logger.debug(`Disconnecting connection: connectionId=${connectionId}`);
      const disconnected = await this.userConnectionService.disconnectConnection(connectionId, reason);
      res.status(200).json({
        success: true,
        message: 'Connection disconnected',
        data: disconnected,
      });
    } catch (error: any) {
      logger.error(`Error in disconnectConnection: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to disconnect connection',
      });
    }
  }

   getUserConnections  = async(req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      logger.debug(`Fetching connections for user: ${userId}`);
      const connections = await this.userConnectionService.fetchUserConnections(userId);
      res.status(200).json({
        success: true,
        message: 'Connections fetched',
        data: connections,
      });
    } catch (error: any) {
      logger.error(`Error in getUserConnections: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch connections',
      });
    }
  }

   getUserRequests  = async(req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      logger.debug(`Fetching user requests for user: ${userId}`);
      const { sentRequests, receivedRequests } = await this.userConnectionService.fetchUserRequests(userId);
      res.status(200).json({
        success: true,
        message: 'User requests fetched successfully',
        data: { sentRequests, receivedRequests },
      });
    } catch (error: any) {
      logger.error(`Error in getUserRequests: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch user requests',
      });
    }
  }

   getAllUserConnections = async(_req: Request, res: Response): Promise<void> => {
    try {
      logger.debug('Fetching all user connections');
      const connections = await this.userConnectionService.fetchAllUserConnections();
      res.status(200).json({
        success: true,
        message: 'All user connections fetched',
        data: connections,
      });
    } catch (error: any) {
      logger.error(`Error in getAllUserConnections: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch all user connections',
      });
    }
  }

   getUserConnectionById  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { connectionId } = req.params;
      logger.debug(`Fetching user connection by ID: ${connectionId}`);
      const connection = await this.userConnectionService.fetchUserConnectionById(connectionId);
      res.status(200).json({
        success: true,
        message: 'User connection fetched',
        data: connection,
      });
    } catch (error: any) {
      logger.error(`Error in getUserConnectionById: ${error.message}`);
      res.status(404).json({
        success: false,
        message: error.message || 'Failed to fetch user connection',
      });
    }
  }
}