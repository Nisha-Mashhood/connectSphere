import axios from "axios";
// import toast from "react-hot-toast";

export const handleError = (error) => {
  if (axios.isCancel(error)) {
    // Handle cancelled request
    throw new Error("Request cancelled - previous request was still pending");
  }

  if (error.response?.status === 429) {
    // toast.error("Too many requests. Please try again later.", { duration: 3000 });
    throw new Error("Too many requests. Please wait before trying again.");
  }

  if (error.response?.status === 403) {
    throw new Error(error.response?.data?.message || "Access forbidden");
  }

  if (error.response?.status === 401) {
    throw new Error(error.response?.data?.message || "Unauthorized access");
  }

  throw new Error(error.response?.data?.message || "An error occurred");
};