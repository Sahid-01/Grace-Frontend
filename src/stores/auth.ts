import { create } from "zustand";
import axios from "axios";
import { authAPI } from "@/Endpoints/api";

export interface User {
  id: number;
  username: string;
  full_name?: string;
  name?: string;
  role?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  student_id?: string | null;
  employee_id?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refresh: string | null;
  error: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isFetchingUser: boolean;
  login: (payload: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  self: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

// Helper functions for localStorage
function getToken(): string | null {
  return localStorage.getItem("token");
}

function getRefresh(): string | null {
  return localStorage.getItem("refresh");
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: getToken(),
  refresh: getRefresh(),
  error: null,
  loading: false,
  isAuthenticated: !!getToken(),
  isFetchingUser: false,

  login: async (payload: { username: string; password: string }) => {
    const { username, password } = payload;

    set({ loading: true, error: null });

    try {
      const res = await axios.post(authAPI.login, { username, password });

      const token = res.data.access;
      const refresh = res.data.refresh;

      // Store tokens
      localStorage.setItem("token", token);
      localStorage.setItem("refresh", refresh);

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({
        token,
        refresh,
        error: null,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err: any) {
      // Clear tokens on error
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");

      set({
        token: null,
        refresh: null,
        error: err.response?.data?.detail || "Login failed",
        isAuthenticated: false,
        loading: false,
      });
    }
  },

  logout: async () => {
    console.log("Logout process started");
    set({ loading: true, error: null });

    const { token, refresh } = get();

    // Try to call logout API if we have tokens
    if (token && refresh) {
      try {
        console.log("Attempting logout with refresh token");

        await axios.post(
          authAPI.logout,
          {
            refresh_token: refresh,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        console.log("Logout API call successful");
      } catch (err: any) {
        console.warn(
          "First logout attempt failed, trying with 'refresh' key:",
          err.response?.data,
        );

        // Try with 'refresh' key if 'refresh_token' failed
        try {
          await axios.post(
            authAPI.logout,
            {
              refresh: refresh,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );
          console.log("Logout API call successful on second attempt");
        } catch (secondErr: any) {
          console.warn(
            "Both logout attempts failed, continuing with local cleanup:",
            secondErr.response?.data,
          );
        }
      }
    } else {
      console.warn("No tokens available for logout API call");
    }

    // CRITICAL: Clear all local state and storage
    console.log("Clearing local storage and state");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");

    // Clear axios authorization header
    delete axios.defaults.headers.common["Authorization"];

    // Reset store state
    set({
      token: null,
      refresh: null,
      user: null,
      isAuthenticated: false,
      isFetchingUser: false,
      loading: false,
      error: null,
    });

    console.log("Logout process completed, state cleared");

    // Force navigation to login page
    // Using window.location for a hard refresh to clear any cached state
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  },

  self: async () => {
    const { token, isFetchingUser } = get();

    // Prevent multiple simultaneous calls
    if (isFetchingUser) {
      console.log("Already fetching user, skipping");
      return;
    }

    set({ loading: true, error: null, isFetchingUser: true });

    try {
      const res = await axios.get(authAPI.self, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      // Handle nested response structure with data field
      const userData = res.data.data || res.data;

      set({ user: userData, loading: false, isFetchingUser: false });
    } catch (err: any) {
      console.error("Auth Store - Error fetching user:", err);

      // If 401, user is not authenticated
      if (err.response?.status === 401) {
        console.log("Unauthorized, clearing auth state");
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        delete axios.defaults.headers.common["Authorization"];

        set({
          user: null,
          token: null,
          refresh: null,
          isAuthenticated: false,
          error: "Session expired. Please login again.",
          loading: false,
          isFetchingUser: false,
        });
      } else {
        set({
          error: err.response?.data?.message || "Failed to fetch user details",
          loading: false,
          isFetchingUser: false,
        });
      }
    }
  },

  setUser: (user: User) => {
    set({ user });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Add axios interceptor to handle 401 responses globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("401 Unauthorized - clearing auth and redirecting to login");

      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      delete axios.defaults.headers.common["Authorization"];

      // Update store state
      useAuthStore.setState({
        user: null,
        token: null,
        refresh: null,
        isAuthenticated: false,
        error: "Session expired. Please login again.",
      });

      // Redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
