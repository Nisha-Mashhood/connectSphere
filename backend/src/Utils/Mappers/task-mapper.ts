import { ITask } from '../../Interfaces/Models/i-task';
import { ITaskDTO } from '../../Interfaces/DTOs/i-task-dto';
import { toUserDTO } from './user-mapper';
import { toGroupDTO } from './group-mapper';
import { IUser } from '../../Interfaces/Models/i-user';
import { IGroup } from '../../Interfaces/Models/i-group';
import { ICollaboration } from '../../Interfaces/Models/i-collaboration';
import logger from '../../core/utils/logger';
import { Types } from 'mongoose';
import { IUserDTO } from '../../Interfaces/DTOs/i-user-dto';
import { IGroupDTO } from '../../Interfaces/DTOs/i-group-dto';
import { ICollaborationDTO } from '../../Interfaces/DTOs/i-collaboration-dto';
import { toCollaborationDTO } from './collaboration-mapper';

export function toTaskDTO(task: ITask | null): ITaskDTO | null {
  if (!task) {
    logger.warn('Attempted to map null task to DTO');
    return null;
  }

  //createdBy (populated IUser or just an ID)
  let createdBy: string;
  let createdByDetails: IUserDTO | undefined;

  if (task.createdBy) {
    if (typeof task.createdBy === 'string') {
      createdBy = task.createdBy;
    } else if (task.createdBy instanceof Types.ObjectId) {
      createdBy = task.createdBy.toString();
    } else {
      createdBy = (task.createdBy as IUser)._id.toString();
      const userDTO = toUserDTO(task.createdBy as IUser);
      createdByDetails = userDTO ?? undefined;
    }
  } else {
    logger.warn(`Task ${task._id} has no createdBy`);
    createdBy = '';
  }

  //assignedUsers (array of IDs or populated IUser objects)
  const assignedUsers: string[] = task.assignedUsers
    ? task.assignedUsers.map((user) =>
        typeof user === 'string'
          ? user
          : user instanceof Types.ObjectId
          ? user.toString()
          : (user as IUser)._id.toString()
      )
    : [];
  const assignedUsersDetails: IUserDTO[] | undefined = task.assignedUsers
    ? task.assignedUsers
        .map((user) =>
          typeof user === 'string' || user instanceof Types.ObjectId
            ? null
            : toUserDTO(user as IUser)
        )
        .filter((dto): dto is IUserDTO => dto !== null)
    : undefined;

  //contextId (populated IUser, IGroup, ICollaboration or just an ID)
  let contextId: string;
  let context: IUserDTO | IGroupDTO | ICollaborationDTO | undefined;

  if (task.contextId) {
    if (typeof task.contextId === 'string') {
      contextId = task.contextId;
    } else if (task.contextId instanceof Types.ObjectId) {
      contextId = task.contextId.toString();
    } else {
      contextId = (task.contextId as any)._id.toString();
      if (task.contextType === 'user') {
        const userDTO = toUserDTO(task.contextId as IUser);
        context = userDTO ?? undefined;
      } else if (task.contextType === 'group') {
        const groupDTO = toGroupDTO(task.contextId as IGroup);
        context = groupDTO ?? undefined;
      } else if (task.contextType === 'collaboration') {
        const collaborationDTO = toCollaborationDTO(task.contextId as ICollaboration);
        context = collaborationDTO ?? undefined;
      }
    }
  } else {
    logger.warn(`Task ${task._id} has no contextId`);
    contextId = '';
  }

  return {
    id: task._id.toString(),
    taskId: task.taskId,
    name: task.name,
    description: task.description,
    image: task.image,
    priority: task.priority,
    status: task.status,
    startDate: task.startDate,
    dueDate: task.dueDate,
    notificationDate: task.notificationDate,
    notificationTime: task.notificationTime,
    contextType: task.contextType,
    contextId,
    context,
    assignedUsers,
    assignedUsersDetails: assignedUsersDetails?.length ? assignedUsersDetails : undefined,
    createdBy,
    createdByDetails,
    createdAt: task.createdAt,
  };
}

export function toTaskDTOs(tasks: ITask[]): ITaskDTO[] {
  return tasks
    .map(toTaskDTO)
    .filter((dto): dto is ITaskDTO => dto !== null);
}