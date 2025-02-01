import axios from "axios";

export const handleError = (error) => {
  if (axios.isCancel(error)) {
    // Handle cancelled request
    throw new Error("Request cancelled - previous request was still pending");
  }

  if (error.response?.status === 429) {
    // toast.error("Too many requests. Please try again later.", { duration: 3000 });
    console.log(error.response.data?.message)
    throw new Error("Too many requests. Please wait before trying again.");
  }

  if (error.response?.status === 403  && error.response.data?.message === "Access forbidden") {
    console.log(error.response.data?.message)
    throw new Error(error.response?.data?.message || "Access forbidden");
  }

  if (error.response?.status === 403 && error.response.data?.message === "Your account has been blocked. Please contact support.") {
    console.log(error.response.data?.message)
    throw new Error(error.response?.data?.message || "Your account has been blocked. Please contact support.");
  }

  if (error.response?.status === 401) {
    console.log(error.response.data?.message)
    throw new Error(error.response?.data?.message || "Unauthorized access");
  }

  if (error.response?.status === 401) {
    console.log(error.response.data?.message)
    throw new Error(error.response?.data?.message || "Unauthorized access");
  }
  
  console.log(error.response.data?.message)
  throw new Error(error.response?.data?.message || "An error occurred");
};