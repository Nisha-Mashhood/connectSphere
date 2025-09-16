import { ITask } from '../../Interfaces/Models/ITask';
import { ITaskDTO } from '../../Interfaces/DTOs/ITaskDTO';

export function toTaskDTO(task: ITask | null): ITaskDTO | null {
  if (!task) return null;

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
    contextId: task.contextId.toString(),
    assignedUsers: task.assignedUsers.map(id => id.toString()),
    createdBy: task.createdBy.toString(),
    createdAt: task.createdAt,
  };
}

export function toTaskDTOs(tasks: ITask[]): ITaskDTO[] {
  return tasks.map(toTaskDTO).filter((dto): dto is ITaskDTO => dto !== null);
}
