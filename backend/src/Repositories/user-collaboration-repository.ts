import { injectable } from 'inversify';
import { Model, PipelineStage, Types } from 'mongoose';
import { BaseRepository } from '../core/repositries/base-repositry';
import { RepositoryError } from '../core/utils/error-handler';
import logger from '../core/utils/logger';
import UserConnection from '../Models/user-connection-model';
import { IUserConnection } from '../Interfaces/Models/i-user-connection';
import { StatusCodes } from '../enums/status-code-enums';
import { IUserConnectionRepository } from '../Interfaces/Repository/i-user-collaboration-repositry';

@injectable()
export class UserConnectionRepository extends BaseRepository<IUserConnection> implements IUserConnectionRepository{
  constructor() {
    super(UserConnection as Model<IUserConnection>);
  }

  private toObjectId = (id?: string | Types.ObjectId): Types.ObjectId => {
    if (!id) {
      logger.warn('Missing ID when converting to ObjectId');
      throw new RepositoryError('Invalid ID: ID is required', StatusCodes.BAD_REQUEST);
    }
    const idStr = typeof id === 'string' ? id : id.toString();
    if (!Types.ObjectId.isValid(idStr)) {
      logger.warn(`Invalid ObjectId format: ${idStr}`);
      throw new RepositoryError('Invalid ID: must be a 24 character hex string', StatusCodes.BAD_REQUEST);
    }
    return new Types.ObjectId(idStr);
  }

   public createUserConnection= async(requesterId: string, recipientId: string): Promise<IUserConnection> =>{
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating user connection for requester ${requesterId}, recipient ${recipientId}`, err);
      throw new RepositoryError('Error creating user connection', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public updateUserConnectionStatus = async (
    connectionId: string,
    status: 'Accepted' | 'Rejected'
  ): Promise<IUserConnection | null> => {
    try {
      logger.debug(`Updating user connection status: connectionId=${connectionId}, status=${status}`);
      const updateFields: Record<string, any> = {
        requestStatus: status,
        connectionStatus: status === 'Accepted' ? 'Connected' : 'Disconnected',
        updatedAt: new Date(),
      };
      if (status === 'Accepted') {
        updateFields.requestAcceptedAt = new Date();
      } else if (status === 'Rejected') {
        updateFields.requestRejectedAt = new Date();
      }
      const connection = await this.findByIdAndUpdate(connectionId, updateFields, { new: true });
      if (!connection) {
        logger.warn(`User connection not found: ${connectionId}`);
        throw new RepositoryError(`User connection not found with ID: ${connectionId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`User connection status updated: ${connectionId} to ${status}`);
      return connection;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating user connection status for connection ${connectionId}`, err);
      throw new RepositoryError('Error updating user connection status', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public disconnectUserConnection = async (connectionId: string, reason: string): Promise<IUserConnection | null> => {
    try {
      logger.debug(`Disconnecting user connection: connectionId=${connectionId}`);
      const connection = await this.findByIdAndUpdate(
        connectionId,
        {
          connectionStatus: 'Disconnected',
          disconnectedAt: new Date(),
          disconnectionReason: reason,
          updatedAt: new Date(),
        },
        { new: true }
      );
      if (!connection) {
        logger.warn(`User connection not found: ${connectionId}`);
        throw new RepositoryError(`User connection not found with ID: ${connectionId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`User connection disconnected: ${connectionId}`);
      return connection;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error disconnecting user connection ${connectionId}`, err);
      throw new RepositoryError('Error disconnecting user connection', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public getUserConnections = async (userId: string): Promise<IUserConnection[]> => {
    try {
      logger.debug(`Fetching connections for user: ${userId}`);
      const connections = await this.model
        .find({
          $or: [{ requester: this.toObjectId(userId) }, { recipient: this.toObjectId(userId) }],
          requestStatus: 'Accepted',
        })
        .populate('requester', '_id name email jobTitle profilePic')
        .populate('recipient', '_id name email jobTitle profilePic')
        .exec();
      logger.info(`Fetched ${connections.length} connections for user ${userId}`);
      return connections;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching user connections for user ${userId}`, err);
      throw new RepositoryError('Error fetching user connections', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public getAllUserConnections = async (
  page: number = 1,
  limit: number = 12,
  search: string = ''
): Promise<{ connections: IUserConnection[]; total: number; page: number; pages: number }> => {
  try {
    logger.debug(`getAllUserConnections → page=${page}, limit=${limit}, search="${search}"`);

    const basePipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'requester',
          foreignField: '_id',
          as: 'requester',
        },
      },
      { $unwind: { path: '$requester', preserveNullAndEmptyArrays: true } },

      // Populate recipient
      {
        $lookup: {
          from: 'users',
          localField: 'recipient',
          foreignField: '_id',
          as: 'recipient',
        },
      },
      { $unwind: { path: '$recipient', preserveNullAndEmptyArrays: true } },
    ] as const;

    const matchStage: any = { requestStatus: 'Accepted' };

    if (search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      matchStage.$or = [
        { 'requester.name': regex },
        { 'requester.email': regex },
        { 'recipient.name': regex },
        { 'recipient.email': regex },
      ];
    }

    const dataPipeline = [
      ...basePipeline,
      { $match: matchStage },
      { $sort: { requestSentAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          connectionId: 1,
          requester: 1,
          recipient: 1,
          requestStatus: 1,
          connectionStatus: 1,
          requestSentAt: 1,
          requestAcceptedAt: 1,
          disconnectedAt: 1,
          disconnectionReason: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ] as PipelineStage[];

    const connections = await this.model.aggregate<IUserConnection>(dataPipeline).exec();

    const countPipeline = [
      ...basePipeline,
      { $match: matchStage },
      { $count: 'total' },
    ] as PipelineStage[];

    const countResult = await this.model.aggregate(countPipeline).exec();
    const total = countResult[0]?.total ?? 0;
    const pages = Math.ceil(total / limit) || 1;

    logger.info(`Fetched ${connections.length} connections | Total: ${total} | Pages: ${pages}`);

    return {
      connections,
      total,
      page,
      pages,
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error in getAllUserConnections', err);
    throw new RepositoryError(
      'Error fetching user connections',
      StatusCodes.INTERNAL_SERVER_ERROR,
      err
    );
  }
};

  public getUserRequests = async (userId: string): Promise<{ sentRequests: IUserConnection[]; receivedRequests: IUserConnection[] }> => {
    try {
      logger.debug(`Fetching sent and received requests for user: ${userId}`);
      const sentRequests = await this.model
        .find({ requester: this.toObjectId(userId) })
        .populate('recipient', '_id name email jobTitle profilePic')
        .sort({ requestSentAt: -1 })
        .exec();

      const receivedRequests = await this.model
        .find({ recipient: this.toObjectId(userId), requestStatus: 'Pending' })
        .populate('requester', '_id name email jobTitle profilePic')
        .sort({ requestSentAt: -1 })
        .exec();

      logger.info(`Fetched ${sentRequests.length} sent and ${receivedRequests.length} received requests for user ${userId}`);
      return { sentRequests, receivedRequests };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching user requests for user ${userId}`, err);
      throw new RepositoryError('Error fetching user requests', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public getUserConnectionById = async (connectionId: string): Promise<IUserConnection | null> => {
    try {
      logger.debug(`Fetching user connection by ID: ${connectionId}`);
      const connection = await this.model
        .findById(this.toObjectId(connectionId))
        .populate('requester', '_id name email jobTitle profilePic')
        .populate('recipient', '_id name email jobTitle profilePic')
        .exec();
      if (!connection) {
        logger.warn(`User connection not found: ${connectionId}`);
        throw new RepositoryError(`User connection not found with ID: ${connectionId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`User connection fetched: ${connectionId}`);
      return connection;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching user connection by ID ${connectionId}`, err);
      throw new RepositoryError('Error fetching user connection by ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public findExistingConnection = async (requesterId: string, recipientId: string): Promise<IUserConnection | null> => {
    try {
      logger.debug(`Checking for existing connection: requester=${requesterId}, recipient=${recipientId}`);
      const connection = await this.model
        .findOne({
          requester: this.toObjectId(requesterId),
          recipient: this.toObjectId(recipientId),
          requestStatus: 'Pending',
        })
        .exec();
      logger.info(
        connection
          ? `Found existing connection: ${connection._id}`
          : `No existing connection found for requester ${requesterId}, recipient ${recipientId}`
      );
      return connection;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error checking existing connection for requester ${requesterId}, recipient ${recipientId}`, err);
      throw new RepositoryError('Error checking existing connection', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public getConnectionUserIds = async (connectionId: string): Promise<{ requester: string; recipient: string } | null> => {
      try {
        logger.debug(`Fetching connection user IDs for connection: ${connectionId}`);
        const connection = await  this.model.findById(this.toObjectId(connectionId))
          .select("requester recipient")
          .exec();
        if (!connection) {
          logger.warn(`Connection not found: ${connectionId}`);
          return null;
        }
        const result = {
          requester: connection.requester.toString(),
          recipient: connection.recipient.toString(),
        };
        logger.info(`Fetched user IDs for connection: ${connectionId}`);
        return result;
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`Error fetching connection user IDs for connection ${connectionId}`, err);
        throw new RepositoryError('Error fetching connection user IDs', StatusCodes.INTERNAL_SERVER_ERROR, err);
      }
    }
}