import { CallModel } from "../models/call.modal.js";
export const create = async (call) => {
    return CallModel.create(call);
};
export const findByChatKey = async (chatKey, limit = 50) => {
    return CallModel.find({ chatKey })
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();
};
export const findByUserId = async (userId, limit = 50) => {
    return CallModel.find({
        $or: [{ callerId: userId }, { recipientId: userId }],
    })
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();
};
//# sourceMappingURL=call.repositry.js.map