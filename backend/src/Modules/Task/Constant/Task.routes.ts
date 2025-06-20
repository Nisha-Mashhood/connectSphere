export const TASK_ROUTES = {
  CreateTask: '/createNewTask/:id',
  GetTasksByContext: '/context/:contextType/:contextId/:userId',
  UpdateTaskPriority: '/updatePriority/:taskId',
  UpdateTaskStatus: '/updateStatus/:taskId',
  EditTask: '/editTask/:taskId',
  DeleteTask: '/delete/:taskId',
} as const;