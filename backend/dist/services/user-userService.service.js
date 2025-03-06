import * as userConnectionRepo from "../repositories/user-userRepo.repositry.js";
export const sendUserConnectionRequest = async (requesterId, recipientId) => {
    // Prevent sending a request to self
    if (requesterId === recipientId) {
        throw new Error("You cannot send a connection request to yourself.");
    }
    // Check if a request already exists
    const existingConnection = await userConnectionRepo.getUserConnections(requesterId);
    const alreadyRequested = existingConnection.find((conn) => conn.recipient.toString() === recipientId && conn.requestStatus === "Pending");
    if (alreadyRequested) {
        throw new Error("A pending request already exists for this user.");
    }
    return await userConnectionRepo.createUserConnection(requesterId, recipientId);
};
export const respondToConnectionRequest = async (connectionId, action) => {
    return await userConnectionRepo.updateUserConnectionStatus(connectionId, action);
};
export const disconnectConnection = async (connectionId, reason) => {
    return await userConnectionRepo.disconnectUserConnection(connectionId, reason);
};
export const fetchUserConnections = async (userId) => {
    return await userConnectionRepo.getUserConnections(userId);
};
export const fetchUserRequests = async (userId) => {
    return await userConnectionRepo.getUserRequests(userId);
};
//FOR ADMIN
// Service to get all user-user collaborations
export const fetchAllUserConnections = async () => {
    return await userConnectionRepo.getAllUserConnections();
};
// Service to get user-user collaboration by ID
export const fetchUserConnectionById = async (connectionId) => {
    return await userConnectionRepo.getUserConnectionWithId(connectionId);
};
//# sourceMappingURL=user-userService.service.js.map