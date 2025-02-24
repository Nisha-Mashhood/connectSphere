import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

//Create Task 
export const create_task = async (createrId, formData) => {
    try {
      const response = await axiosInstance.post(`/task/createNewTask/${createrId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  };

  // Get Tasks by Context
export const get_tasks_by_context = async (contextType, contextId) => {
  try {
    const response = await axiosInstance.get(`/task/context/${contextType}/${contextId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Update Task Priority
export const update_task_priority = async (taskId, priority) => {
  try {
    const response = await axiosInstance.patch(`/task/updatePriority/${taskId}`, { priority });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Update Task Status
export const update_task_status = async (taskId, status) => {
  try {
    const response = await axiosInstance.patch(`/task/updateStatus/${taskId}`, { status });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Edit Task
export const edit_task = async (taskId, updates) => {
  try {
    const response = await axiosInstance.put(`/task/editTask/${taskId}`, updates);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};