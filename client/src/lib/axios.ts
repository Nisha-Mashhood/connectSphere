import axios from "axios";
import axiosRetry from "axios-retry";
import { store } from "../redux/store"; 
import { signOut } from "../redux/Slice/userSlice";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// Configure retry logic
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => {
    // Don't retry if it's a rate limit error
    if (error.response?.status === 429) return false;
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
      const token = document.cookie
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
      const originalRequest = error.config;
      
      // Clean up the pending request on error
      if (originalRequest) {
        const requestKey = getRequestKey(originalRequest);
        pendingRequests.delete(requestKey);
      }

      if (axios.isCancel(error)) {
        return Promise.reject(new Error("Request cancelled"));
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const response = await axiosInstance.post("/auth/refresh-token");
          const { newAccessToken } = response.data;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          store.dispatch(signOut());
          navigate("/login");
          return Promise.reject(refreshError);
        }
      }

      // Let the error handler deal with specific error cases
      return Promise.reject(error);
    }
  );
};