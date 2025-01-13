import axios from "axios";
import toast from "react-hot-toast";
import { store } from "../redux/store"; 
import { signOut } from "../redux/Slice/userSlice";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

export const setupInterceptor = (navigate) => {
  // Request interceptor to add auth header
  axiosInstance.interceptors.request.use(
    (config) => {
      const accessToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for handling auth errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle forbidden access (403)
      if (error.response?.status === 403) {
        toast.error(error.response?.data?.message || "Access Forbidden", {
          position: "top-right",
          duration: 3000,
        });
        navigate("/forbidden");
        return Promise.reject(error);
      }

      // Handle unauthorized access (401)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh the token
          const response = await axiosInstance.post("/auth/refresh-token");
          const { newAccessToken } = response.data;

          // Update the request header with new token
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          
          // Retry the original request
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, log out the user
          store.dispatch(signOut());
          toast.error("Session expired. Please login again.", {
            position: "top-right",
            duration: 3000,
          });
          navigate("/login");
          return Promise.reject(refreshError);
        }
      }

      // Handle other errors
      toast.error(
        error.response?.data?.message || "An error occurred",
        {
          position: "top-right",
          duration: 3000,
        }
      );
      return Promise.reject(error);
    }
  );
};