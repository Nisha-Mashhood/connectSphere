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
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  };

  // Get Tasks by Context
export const get_tasks_by_context = async (contextType, contextId, userId) => {
  try {
    const response = await axiosInstance.get(`/task/context/${contextType}/${contextId}/${userId}`);
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Update Task Priority
export const update_task_priority = async (taskId, priority) => {
  try {
    const response = await axiosInstance.patch(`/task/updatePriority/${taskId}`, { priority });
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Update Task Status
export const update_task_status = async (taskId, status) => {
  try {
    const response = await axiosInstance.patch(`/task/updateStatus/${taskId}`, { status });
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Edit Task
export const edit_task = async (taskId, formData) => {
  try {
    const response = await axiosInstance.put(
      `/task/editTask/${taskId}`,
      formData
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//Delete Task
export const  delete_task = async(taskId) =>{
  try{
    const response = await axiosInstance.delete(`/task/delete/${taskId}`);
    return response.data.data;
  } catch(error) {
     handleError(error);
  }
}

