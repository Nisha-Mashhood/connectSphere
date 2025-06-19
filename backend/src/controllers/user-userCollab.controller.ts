import { Request, Response } from "express";
import * as userConnectionService from "../services/user-userService.service.js";

// Send user-to-user request
export const sendRequestController = async (req: Request, res: Response) => {
  const { id: requesterId } = req.params;
  const { recipientId } = req.body;

  try {
    const newConnection = await userConnectionService.sendUserConnectionRequest(
      requesterId,
      recipientId
    );
    res
      .status(201)
      .json({ message: "Connection request sent", data: newConnection });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Accept or Reject request
export const respondToRequestController = async (
  req: Request,
  res: Response
) => {
  const { connectionId } = req.params;
  const { action } = req.body; // "Accepted" or "Rejected"

  try {
    const updatedConnection =
      await userConnectionService.respondToConnectionRequest(
        connectionId,
        action
      );
    res
      .status(200)
      .json({
        message: `Request ${action.toLowerCase()}`,
        data: updatedConnection,
      });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Disconnect user connection
export const disconnectConnectionController = async (
  req: Request,
  res: Response
) => {
  const { connectionId } = req.params;
  const { reason } = req.body;

  try {
    const disconnected = await userConnectionService.disconnectConnection(
      connectionId,
      reason
    );
    res
      .status(200)
      .json({ message: "Connection disconnected", data: disconnected });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Get all connections for a user
export const getUserConnectionsController = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params;

  try {
    const connections = await userConnectionService.fetchUserConnections(
      userId
    );
    console.log("user Conections from backend : ", connections);
    res.status(200).json({ message: "Connections fetched", data: connections });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Fetch sent and received user-user requests
export const getUserRequestsController = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params;

  try {
    const { sentRequests, receivedRequests } =
      await userConnectionService.fetchUserRequests(userId);
    res.status(200).json({
      message: "User requests fetched successfully",
      sentRequests,
      receivedRequests,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

//FOR ADMIN
// Get all user-user collaborations
export const getAllUserConnectionsController = async (
  _req: Request,
  res: Response
) => {
  try {
    const connections = await userConnectionService.fetchAllUserConnections();
    res.status(200).json(connections);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific user-user collaboration by ID
export const getUserConnectionByIdController = async (
  req: Request,
  res: Response
) => {
  console.log("Inside the controller");
  try {
    const connectionId = req.params.connectionId;
    console.log("Connection Id in Controller :", connectionId);
    const connection = await userConnectionService.fetchUserConnectionById(
      connectionId
    );
    if (!connection) {
      console.log("No connection found for this connectionId");
    }
    res.status(200).json(connection);
  } catch (error: any) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
