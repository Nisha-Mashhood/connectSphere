import UserConnection from "../models/userConnection.modal.js";
export const createUserConnection = async (requesterId, recipientId) => {
    const newConnection = new UserConnection({
        requester: requesterId,
        recipient: recipientId,
    });
    return await newConnection.save();
};
export const updateUserConnectionStatus = async (connectionId, status) => {
    const updateFields = {
        requestStatus: status,
        connectionStatus: status === "Accepted" ? "Connected" : "Disconnected",
    };
    if (status === "Accepted") {
        updateFields.requestAcceptedAt = new Date();
    }
    else if (status === "Rejected") {
        updateFields.requestRejectedAt = new Date();
    }
    return await UserConnection.findByIdAndUpdate(connectionId, updateFields, { new: true });
};
export const disconnectUserConnection = async (connectionId, reason) => {
    return await UserConnection.findByIdAndUpdate(connectionId, {
        connectionStatus: "Disconnected",
        disconnectedAt: new Date(),
        disconnectionReason: reason,
    }, { new: true });
};
export const getUserConnections = async (userId) => {
    return await UserConnection.find({
        $or: [{ requester: userId }, { recipient: userId }],
        requestStatus: "Accepted",
    }).populate("requester recipient");
};
// Fetch sent and received requests
export const getUserRequests = async (userId) => {
    const sentRequests = await UserConnection.find({ requester: userId })
        .populate("recipient")
        .sort({ requestSentAt: -1 });
    const receivedRequests = await UserConnection.find({ recipient: userId, requestStatus: "Pending" })
        .populate("requester")
        .sort({ requestSentAt: -1 });
    return { sentRequests, receivedRequests };
};
//# sourceMappingURL=user-userRepo.repositry.js.map