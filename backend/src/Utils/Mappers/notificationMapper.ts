import { IAppNotification } from '../../Interfaces/Models/IAppNotification';
import { IAppNotificationDTO } from '../../Interfaces/DTOs/IAppNotificationDTO';
import { toUserDTO } from './UserMapper';
import { IUser } from '../../Interfaces/Models/IUser';
import logger from '../../Core/Utils/Logger';
import { Types } from 'mongoose';
import { IUserDTO } from '../../Interfaces/DTOs/IUserDTO';

export function toNotificationDTO(notification: IAppNotification | null): IAppNotificationDTO | null {
  if (!notification) {
    logger.warn('Attempted to map null notification to DTO');
    return null;
  }

  //userId (populated IUser or just an ID)
  let userId: string;
  let user: IUserDTO | undefined;

  if (notification.userId) {
    if (typeof notification.userId === 'string') {
      userId = notification.userId;
    } else if (notification.userId instanceof Types.ObjectId) {
      userId = notification.userId.toString();
    } else {
      //IUser object (populated)
      userId = (notification.userId as IUser)._id.toString();
      const userDTO = toUserDTO(notification.userId as IUser);
      user = userDTO ?? undefined;
    }
  } else {
    logger.warn(`Notification ${notification._id} has no userId`);
    userId = '';
  }

  //senderId (populated IUser or just an ID)
  let senderId: string;
  let sender: IUserDTO | undefined;

  if (notification.senderId) {
    if (typeof notification.senderId === 'string') {
      senderId = notification.senderId;
    } else if (notification.senderId instanceof Types.ObjectId) {
      senderId = notification.senderId.toString();
    } else {
      //IUser object (populated)
      senderId = (notification.senderId as IUser)._id.toString();
      const senderDTO = toUserDTO(notification.senderId as IUser);
      sender = senderDTO ?? undefined;
    }
  } else {
    logger.warn(`Notification ${notification._id} has no senderId`);
    senderId = '';
  }

  return {
    id: notification._id.toString(),
    AppNotificationId: notification.AppNotificationId,
    userId,
    user,
    type: notification.type,
    content: notification.content,
    relatedId: notification.relatedId,
    senderId,
    sender,
    status: notification.status,
    callId: notification.callId,
    callType: notification.callType,
    notificationDate: notification.notificationDate?.toISOString().split('T')[0],
    notificationTime: notification.notificationTime,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
    taskContext: notification.taskContext
      ? {
          contextType: notification.taskContext.contextType,
          contextId: notification.taskContext.contextId,
        }
      : undefined,
  };
}

export function toNotificationDTOs(notifications: IAppNotification[]): IAppNotificationDTO[] {
  return notifications
    .map(toNotificationDTO)
    .filter((dto): dto is IAppNotificationDTO => dto !== null);
}