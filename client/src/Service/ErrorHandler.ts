import axios from "axios";

export const handleError = (error) => {
  if (axios.isCancel(error)) {
    console.log("Request cancelled (expected):", error.message);
    return;
  }

  if (error.response?.status === 429) {
    throw new Error("Too many requests. Please wait.");
  }

  if (error.response?.status === 403) {
    const msg = error.response.data?.message;
    if (msg === "Access forbidden" || msg?.includes("blocked")) {
      throw new Error(msg);
    }
  }

  if (error.response?.status === 401) {
    throw new Error(error.response.data?.message || "Unauthorized");
  }

  throw new Error(error.response?.data?.message || "An error occurred");
};