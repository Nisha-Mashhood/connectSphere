export const handleError = (error) => {
    if (error.response?.status === 403) {
      throw new Error(error.response?.data?.message || "Access forbidden");
    }
  
    if (error.response?.status === 401) {
      throw new Error(error.response?.data?.message || "Unauthorized access");
    }
  
    throw new Error(error.response?.data?.message || "An error occurred");
  };