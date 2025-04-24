import { Call } from "../models/call.modal.js";
import * as callRepositry from '../repositories/call.repositry.js';
// import * as notificationService from "../services/notification.service.js";

  export const logCall = async(
    chatKey: string,
    callerId: string,
    recipientId: string,
    type: 'audio' | 'video',
    status: 'incoming' | 'answered' | 'missed'
  ): Promise<Call> => {
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
  }

  export const getCallsByChatKey = async(chatKey: string): Promise<Call[]> => {
    return callRepositry.findByChatKey(chatKey);
  }

  export const getCallsByUserId = async(userId: string): Promise<Call[]> => {
    return callRepositry.findByUserId(userId);
  }