import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../../core/Repositries/BaseRepositry';
import { RepositoryError } from '../../../core/Utils/ErrorHandler';
import logger from '../../../core/Utils/Logger';
import UserConnection from '../../../models/userConnection.modal';
import { IUserConnection } from '../../../Interfaces/models/IUserConnection';

export class UserConnectionRepository extends BaseRepository<IUserConnection> {
  constructor() {
    super(UserConnection as Model<IUserConnection>);
  }

  private toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    if (!id) {
      logger.error('Missing ID');
      throw new RepositoryError('Invalid ID: ID is required');
    }
    const idStr = typeof id === 'string' ? id : id.toString();
    if (!Types.ObjectId.isValid(idStr)) {
      logger.error(`Invalid ID: ${idStr}`);
      throw new RepositoryError('Invalid ID: must be a 24 character hex string');
    }
    return new Types.ObjectId(idStr);
  }

   createUserConnection= async(requesterId: string, recipientId: string): Promise<IUserConnection> =>{
    try {
      logger.debug(`Creating user connection: requester=${requesterId}, recipient=${recipientId}`);
      return await this.create({
        requester: this.toObjectId(requesterId),
        recipient: this.toObjectId(recipientId),
        requestStatus: 'Pending',
        connectionStatus: 'Disconnected',
        requestSentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error: any) {
      logger.error(`Error creating user connection: ${error.message}`);
      throw new RepositoryError(`Error creating user connection: ${error.message}`);
    }
  }

   updateUserConnectionStatus = async(
    connectionId: string,
    status: 'Accepted' | 'Rejected'
  ): Promise<IUserConnection | null> => {
    try {
      logger.debug(`Updating user connection status: connectionId=${connectionId}, status=${status}`);
      const updateFields: any = {
        requestStatus: status,
        connectionStatus: status === 'Accepted' ? 'Connected' : 'Disconnected',
        updatedAt: new Date(),
      };
      if (status === 'Accepted') {
        updateFields.requestAcceptedAt = new Date();
      } else if (status === 'Rejected') {
        updateFields.requestRejectedAt = new Date();
      }
      return await this.findByIdAndUpdate(this.toObjectId(connectionId).toString(), updateFields, { new: true });
    } catch (error: any) {
      logger.error(`Error updating user connection status: ${error.message}`);
      throw new RepositoryError(`Error updating user connection status: ${error.message}`);
    }
  }

   disconnectUserConnection = async(connectionId: string, reason: string): Promise<IUserConnection | null> =>{
    try {
      logger.debug(`Disconnecting user connection: connectionId=${connectionId}`);
      return await this.findByIdAndUpdate(
        this.toObjectId(connectionId).toString(),
        {
          connectionStatus: 'Disconnected',
          disconnectedAt: new Date(),
          disconnectionReason: reason,
          updatedAt: new Date(),
        },
        { new: true }
      );
    } catch (error: any) {
      logger.error(`Error disconnecting user connection: ${error.message}`);
      throw new RepositoryError(`Error disconnecting user connection: ${error.message}`);
    }
  }

   getUserConnections = async(userId: string): Promise<IUserConnection[]> =>{
    try {
      logger.debug(`Fetching connections for user: ${userId}`);
      return await this.model
        .find({
          $or: [{ requester: this.toObjectId(userId) }, { recipient: this.toObjectId(userId) }],
          requestStatus: 'Accepted',
        })
        .populate('requester', 'name email jobTitle profilePic')
        .populate('recipient', 'name email jobTitle profilePic')
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching user connections: ${error.message}`);
      throw new RepositoryError(`Error fetching user connections: ${error.message}`);
    }
  }

   getUserRequests= async(userId: string): Promise<{ sentRequests: IUserConnection[]; receivedRequests: IUserConnection[] }> =>{
    try {
      logger.debug(`Fetching sent and received requests for user: ${userId}`);
      const sentRequests = await this.model
        .find({ requester: this.toObjectId(userId) })
        .populate('recipient', 'name email jobTitle profilePic')
        .sort({ requestSentAt: -1 })
        .exec();

      const receivedRequests = await this.model
        .find({ recipient: this.toObjectId(userId), requestStatus: 'Pending' })
        .populate('requester', 'name email jobTitle profilePic')
        .sort({ requestSentAt: -1 })
        .exec();

      return { sentRequests, receivedRequests };
    } catch (error: any) {
      logger.error(`Error fetching user requests: ${error.message}`);
      throw new RepositoryError(`Error fetching user requests: ${error.message}`);
    }
  }

   getAllUserConnections = async(): Promise<IUserConnection[]> =>{
    try {
      logger.debug('Fetching all user connections');
      return await this.model
        .find()
        .populate('requester', 'name email jobTitle profilePic')
        .populate('recipient', 'name email jobTitle profilePic')
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching all user connections: ${error.message}`);
      throw new RepositoryError(`Error fetching all user connections: ${error.message}`);
    }
  }

   getUserConnectionById = async(connectionId: string): Promise<IUserConnection | null> =>{
    try {
      logger.debug(`Fetching user connection by ID: ${connectionId}`);
      const connection = await this.model
        .findById(this.toObjectId(connectionId))
        .populate('requester', 'name email jobTitle profilePic')
        .populate('recipient', 'name email jobTitle profilePic')
        .exec();
      if (!connection) {
        throw new RepositoryError('No user connection found for this ID');
      }
      return connection;
    } catch (error: any) {
      logger.error(`Error retrieving user connection: ${error.message}`);
      throw new RepositoryError(`Error retrieving user connection: ${error.message}`);
    }
  }

   findExistingConnection = async(requesterId: string, recipientId: string): Promise<IUserConnection | null> =>{
    try {
      logger.debug(`Checking for existing connection: requester=${requesterId}, recipient=${recipientId}`);
      return await this.model
        .findOne({
          requester: this.toObjectId(requesterId),
          recipient: this.toObjectId(recipientId),
          requestStatus: 'Pending',
        })
        .exec();
    } catch (error: any) {
      logger.error(`Error checking existing connection: ${error.message}`);
      throw new RepositoryError(`Error checking existing connection: ${error.message}`);
    }
  }
}