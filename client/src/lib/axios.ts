import axios from "axios";
import axiosRetry from "axios-retry";
import { store } from "../redux/store"; 
import { signOut } from "../redux/Slice/userSlice";
import toast from "react-hot-toast";
import logger from "./Logger";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Configure retry logic
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => {
    // Don't retry if it's a rate limit error
    if (error.response?.status === 429 || axios.isCancel(error)) {
      return false;
    }
    return axiosRetry.isNetworkOrIdempotentRequestError(error);
  },
});

// Track in-flight requests
const pendingRequests = new Map();

// Get unique key for request
const getRequestKey = (config) => {
  const { method, url, params, data } = config;
  return `${method}-${url}-${JSON.stringify(params || {})}-${JSON.stringify(data || {})}`;
};

// Add request deduplication logic
export const setupInterceptors = (navigate) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const requestKey = getRequestKey(config);
      
      // If there's already a pending request with the same key, cancel it
      if (pendingRequests.has(requestKey)) {
        const controller = pendingRequests.get(requestKey);
        controller.abort();
      }

      // Create new controller for this request
      const controller = new AbortController();
      pendingRequests.set(requestKey, controller);
      config.signal = controller.signal;

      // Add auth token
      const token = localStorage.getItem("authToken") || 
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      // Clean up the pending request on success
      const requestKey = getRequestKey(response.config);
      pendingRequests.delete(requestKey);
      return response;
    },
    async (error) => {
  
      if (error?.config) {
        const requestKey = getRequestKey(error.config);
        pendingRequests.delete(requestKey);
      }

      if (axios.isCancel(error)) {
        console.warn("Request cancelled - previous request was still pending");
        return Promise.reject(error);
      }

      if (error.response?.status === 429) {
        toast.error("Too many requests. Please try again later.", { duration: 3000 });
        console.log(error.response.data?.message);
        throw new Error("Too many requests. Please wait before trying again.");
      }

      if (error.response?.status === 403) {
        console.log(error.response.data?.message);
        throw new Error(error.response?.data?.message || "Access forbidden");
      }

      if (error.response?.status === 403 && error.response.data?.message === "Your account has been blocked. Please contact support.") {
        toast.error("Your account has been blocked. Please contact support.");
        store.dispatch(signOut());
        navigate("/login");
        throw new Error("Your account has been blocked. Please contact support.");
      }

      if (error.response?.status === 401 && !error.config?._retry) {
        error.config._retry = true;
        try {
          const response = await axiosInstance.post("/auth/refresh-token", {}, { withCredentials: true });
          const { newAccessToken } = response.data;
          logger.info(`New Acess Token created : ${newAccessToken}`);
          // document.cookie = `accessToken=${newAccessToken}; path=/;`;
          // error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(error.config);
        } catch (refreshError) {
          store.dispatch(signOut());
          navigate("/login");
          return Promise.reject(refreshError);
        }
      }

      // Let the error handler deal with specific error cases
      console.error(error);
      throw new Error(error || "An error occurred");
    }
  );
};


