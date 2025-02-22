import UserConnection from "../models/userConnection.modal.js";
export const createUserConnection = async (requesterId, recipientId) => {
    const newConnection = new UserConnection({
        requester: requesterId,
        recipient: recipientId,
    });
    return await newConnection.save();
};
export const updateUserConnectionStatus = async (connectionId, status) => {
    const updateFields = { requestStatus: status };
    if (status === "Accepted")
        updateFields.requestAcceptedAt = new Date();
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
    }).populate("requester recipient");
};
//# sourceMappingURL=user-userRepo.repositry.js.map