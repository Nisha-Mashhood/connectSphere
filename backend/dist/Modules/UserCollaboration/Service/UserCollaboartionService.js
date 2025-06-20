import { BaseService } from '../../../core/Services/BaseService.js';
import { ServiceError } from '../../../core/Utils/ErrorHandler.js';
import logger from '../../../core/Utils/Logger.js';
import { UserConnectionRepository } from '../Repositry/UserCollaborationRepositry.js';
import { ContactRepository } from '../../Contact/Repositry/ContactRepositry.js';
export class UserConnectionService extends BaseService {
    userConnectionRepo;
    contactRepo;
    constructor() {
        super();
        this.userConnectionRepo = new UserConnectionRepository();
        this.contactRepo = new ContactRepository();
    }
    sendUserConnectionRequest = async (requesterId, recipientId) => {
        logger.debug(`Sending connection request: requester=${requesterId}, recipient=${recipientId}`);
        this.checkData({ requesterId, recipientId });
        if (requesterId === recipientId) {
            logger.error('Attempt to send connection request to self');
            throw new ServiceError('You cannot send a connection request to yourself');
        }
        const existingConnection = await this.userConnectionRepo.findExistingConnection(requesterId, recipientId);
        if (existingConnection) {
            logger.error(`Pending request already exists: requester=${requesterId}, recipient=${recipientId}`);
            throw new ServiceError('A pending request already exists for this user');
        }
        return await this.userConnectionRepo.createUserConnection(requesterId, recipientId);
    };
    respondToConnectionRequest = async (connectionId, action) => {
        logger.debug(`Responding to connection request: connectionId=${connectionId}, action=${action}`);
        this.checkData({ connectionId, action });
        const updatedConnection = await this.userConnectionRepo.updateUserConnectionStatus(connectionId, action);
        if (!updatedConnection) {
            logger.error(`Connection not found: connectionId=${connectionId}`);
            throw new ServiceError('Connection not found');
        }
        if (action === 'Accepted') {
            const requesterId = updatedConnection.requester.toString();
            const recipientId = updatedConnection.recipient.toString();
            const [contact1, contact2] = await Promise.all([
                this.contactRepo.createContact({
                    userId: requesterId,
                    targetUserId: recipientId,
                    userConnectionId: connectionId,
                    type: 'user-user',
                }),
                this.contactRepo.createContact({
                    userId: recipientId,
                    targetUserId: requesterId,
                    userConnectionId: connectionId,
                    type: 'user-user',
                }),
            ]);
            return { updatedConnection, contacts: [contact1, contact2] };
        }
        return { updatedConnection };
    };
    disconnectConnection = async (connectionId, reason) => {
        logger.debug(`Disconnecting connection: connectionId=${connectionId}`);
        this.checkData({ connectionId, reason });
        return await this.userConnectionRepo.disconnectUserConnection(connectionId, reason);
    };
    fetchUserConnections = async (userId) => {
        logger.debug(`Fetching connections for user: ${userId}`);
        this.checkData(userId);
        return await this.userConnectionRepo.getUserConnections(userId);
    };
    fetchUserRequests = async (userId) => {
        logger.debug(`Fetching user requests for user: ${userId}`);
        this.checkData(userId);
        return await this.userConnectionRepo.getUserRequests(userId);
    };
    fetchAllUserConnections = async () => {
        logger.debug('Fetching all user connections');
        return await this.userConnectionRepo.getAllUserConnections();
    };
    fetchUserConnectionById = async (connectionId) => {
        logger.debug(`Fetching user connection by ID: ${connectionId}`);
        this.checkData(connectionId);
        return await this.userConnectionRepo.getUserConnectionById(connectionId);
    };
}
//# sourceMappingURL=UserCollaboartionService.js.map