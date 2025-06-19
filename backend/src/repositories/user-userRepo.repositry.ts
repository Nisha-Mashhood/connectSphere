import { IUserConnection } from "../Interfaces/models/IUserConnection.js";
import UserConnection from "../models/userConnection.modal.js";

export const createUserConnection = async (requesterId: string, recipientId: string): Promise<IUserConnection> => {
  const newConnection = new UserConnection({
    requester: requesterId,
    recipient: recipientId,
  });
  return await newConnection.save();
};

export const updateUserConnectionStatus = async (
  connectionId: string,
  status: "Accepted" | "Rejected"
): Promise<IUserConnection | null> => {
  const updateFields: any = {
    requestStatus: status,
    connectionStatus: status === "Accepted" ? "Connected" : "Disconnected", 
  };

  if (status === "Accepted") {
    updateFields.requestAcceptedAt = new Date();
  } else if (status === "Rejected") {
    updateFields.requestRejectedAt = new Date();
  }

  return await UserConnection.findByIdAndUpdate(connectionId, updateFields, { new: true });
};

export const disconnectUserConnection = async (connectionId: string, reason: string): Promise<IUserConnection | null> => {
  return await UserConnection.findByIdAndUpdate(
    connectionId,
    {
      connectionStatus: "Disconnected",
      disconnectedAt: new Date(),
      disconnectionReason: reason,
    },
    { new: true }
  );
};

export const getUserConnections = async (userId: string): Promise<IUserConnection[]> => {
  return await UserConnection.find({
    $or: [{ requester: userId }, { recipient: userId }],
    requestStatus: "Accepted", 
  }).populate("requester recipient");
};


// Fetch sent and received requests
export const getUserRequests = async (userId: string) => {
    const sentRequests = await UserConnection.find({ requester: userId })
      .populate("recipient")
      .sort({ requestSentAt: -1 });
  
    const receivedRequests = await UserConnection.find({ recipient: userId, requestStatus: "Pending" })
      .populate("requester")
      .sort({ requestSentAt: -1 });
  
    return { sentRequests, receivedRequests };
  };

  //FOR ADMIN
//Get All user-user collaborations
export const getAllUserConnections = async (): Promise<IUserConnection[]> => {
  return await UserConnection.find().populate("requester recipient");
};

//Get the user connection details with connection Id
export const getUserConnectionWithId = async (connectionId:string): Promise<IUserConnection> => {
 try {
  const userConnection = await UserConnection.findById(connectionId).populate("requester recipient");
  if(!userConnection){
    throw new Error("no user connection found for this Id");
  }
  return userConnection;
 } catch (error) {
  throw new Error("Error retrieving  details from the database");
 }
};
