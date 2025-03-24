import { createContact } from "../repositories/contacts.repository.js";
import { IUserConnection } from "../models/userConnection.modal.js";
import * as userConnectionRepo from "../repositories/user-userRepo.repositry.js";

export const sendUserConnectionRequest = async (requesterId: string, recipientId: string) => {
  // Prevent sending a request to self
  if (requesterId === recipientId) {
    throw new Error("You cannot send a connection request to yourself.");
  }

  // Check if a request already exists
  const existingConnection = await userConnectionRepo.getUserConnections(requesterId);
  const alreadyRequested = existingConnection.find(
    (conn) => conn.recipient.toString() === recipientId && conn.requestStatus === "Pending"
  );

  if (alreadyRequested) {
    throw new Error("A pending request already exists for this user.");
  }

  return await userConnectionRepo.createUserConnection(requesterId, recipientId);
};

export const respondToConnectionRequest = async (connectionId: string, action: "Accepted" | "Rejected") => {
  const updatedConnection = await userConnectionRepo.updateUserConnectionStatus(connectionId, action);

  if (!updatedConnection) {
    throw new Error("Connection not found");
  }

  // If the request is accepted, create Contact entries
  if (action === "Accepted") {
    const requesterId = updatedConnection.requester.toString();
  const recipientId = updatedConnection.recipient.toString();
  const [contact1, contact2] = await Promise.all([
    createContact({ userId: requesterId, targetUserId: recipientId, userConnectionId: connectionId, type: "user-user" }),
    createContact({ userId: recipientId, targetUserId: requesterId, userConnectionId: connectionId, type: "user-user" }),
  ]);
  return { updatedConnection, contacts: [contact1, contact2] };
  }

  return updatedConnection;
};

export const disconnectConnection = async (connectionId: string, reason: string) => {
  return await userConnectionRepo.disconnectUserConnection(connectionId, reason);
};

export const fetchUserConnections = async (userId: string) => {
  return await userConnectionRepo.getUserConnections(userId);
};

export const fetchUserRequests = async (userId: string) => {
    return await userConnectionRepo.getUserRequests(userId);
  };

  //FOR ADMIN
  // Service to get all user-user collaborations
export const fetchAllUserConnections = async (): Promise<IUserConnection[]> => {
  return await userConnectionRepo.getAllUserConnections();
};

// Service to get user-user collaboration by ID
export const fetchUserConnectionById = async (connectionId: string): Promise<IUserConnection> => {
  return await userConnectionRepo.getUserConnectionWithId(connectionId);
};

