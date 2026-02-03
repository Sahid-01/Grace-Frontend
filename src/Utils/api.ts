import axios, { type AxiosInstance } from "axios";

// Create axios instance with base URL
const API_BASE_URL = import.meta.env.VITE_API_URL;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Login API call
export const loginUser = async (username: string, password: string) => {
  try {
    const response = await api.post("login/", {
      username,
      password,
    });

    // Just return the response data, let the component handle token storage
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem("authToken");
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api.get("self/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
