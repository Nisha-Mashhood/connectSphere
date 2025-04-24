import * as callRepositry from '../repositories/call.repositry.js';
// import * as notificationService from "../services/notification.service.js";
export const logCall = async (chatKey, callerId, recipientId, type, status) => {
    const call = await callRepositry.create({
        chatKey,
        callerId,
        recipientId,
        type,
        status,
        timestamp: new Date(),
    });
    // if (status === 'incoming') {
    //   await notificationService.createNotification(
    //     recipientId,
    //     'incoming_call',
    //     `Incoming ${type} call from user ${callerId}`,
    //     chatKey
    //   );
    // } else if (status === 'missed') {
    //   await notificationService.createNotification(
    //     recipientId,
    //     'missed_call',
    //     `Missed ${type} call from user ${callerId}`,
    //     chatKey
    //   );
    // }
    return call;
};
export const getCallsByChatKey = async (chatKey) => {
    return callRepositry.findByChatKey(chatKey);
};
export const getCallsByUserId = async (userId) => {
    return callRepositry.findByUserId(userId);
};
//# sourceMappingURL=call.service.js.map