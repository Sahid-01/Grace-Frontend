import { create } from "zustand";
import axios from "axios";
import { UserApi } from "@/Endpoints/users";

export interface UserData {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  branch?: number | null;
  branch_name?: string;
  enrolled_courses?: number[];
  enrolled_courses_details?: Array<{
    id: number;
    title: string;
    course_type: string;
    branch: string | null;
  }>;
  is_active?: boolean;
  is_deleted?: boolean;
  student_id?: string | null;
  employee_id?: string | null;
  password?: string;
  password_confirm?: string;
}

export interface PaginationMeta {
  total: number;
  last_page: number;
  current_page: number;
  per_page: number;
}

interface UsersState {
  users: UserData[];
  loading: boolean;
  error: string | null;
  currentUser: UserData | null;
  pagination: PaginationMeta | null;

  // Fetch all users with pagination
  fetchUsers: (
    page?: number,
    perPage?: number,
    filters?: {
      search?: string;
      role?: string;
      student_id?: string;
      employee_id?: string;
    },
  ) => Promise<void>;

  // Fetch users by role
  fetchUsersByRole: (role: string) => Promise<void>;

  // Get single user
  getUser: (id: number | string) => Promise<void>;

  // Create user (role-based)
  createUser: (
    userData: Partial<UserData>,
    currentUserRole: string,
  ) => Promise<void>;

  // Update user
  updateUser: (
    id: number | string,
    userData: Partial<UserData>,
  ) => Promise<void>;

  // Patch user
  patchUser: (
    id: number | string,
    userData: Partial<UserData>,
  ) => Promise<void>;

  // Delete user
  deleteUser: (id: number | string) => Promise<void>;

  // Activate user
  activateUser: (id: number | string) => Promise<void>;

  // Deactivate user
  deactivateUser: (id: number | string) => Promise<void>;

  // Change password
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;

  // Clear error
  clearError: () => void;

  // Check if user can add role
  canAddRole: (currentUserRole: string, targetRole: string) => boolean;
}

export const useUsersStore = create<UsersState>()((set, get) => ({
  users: [],
  loading: false,
  error: null,
  currentUser: null,
  pagination: null,

  // Check if current user can add a specific role
  canAddRole: (currentUserRole: string, targetRole: string): boolean => {
    const role = currentUserRole.toLowerCase();
    const target = targetRole.toLowerCase();

    // Superadmin can add anyone
    if (role === "superadmin") {
      return true;
    }

    // Admin can add everyone except superadmin
    if (role === "admin") {
      return target !== "superadmin";
    }

    // Teacher can only add students
    if (role === "teacher") {
      return target === "student";
    }

    // Other roles cannot add users
    return false;
  },

  fetchUsers: async (page = 1, perPage = 10, filters = {}) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");

      // Build query parameters
      const params: any = {
        page,
        per_page: perPage,
      };

      // Add filters if provided
      if (filters.search) params.search = filters.search;
      if (filters.role && filters.role !== "all") params.role = filters.role;
      if (filters.student_id) params.student_id = filters.student_id;
      if (filters.employee_id) params.employee_id = filters.employee_id;

      const res = await axios.get(UserApi.fetchUsers, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle paginated response structure
      const usersData = res.data.data || res.data.results || res.data;
      const meta = res.data.meta;

      // Filter out deleted users
      const activeUsers = Array.isArray(usersData)
        ? usersData.filter((user: UserData) => !user.is_deleted)
        : [];

      set({
        users: activeUsers,
        pagination: meta || null,
        loading: false,
      });
    } catch (err: any) {
      console.error("Fetch Users Error:", err.response?.data);
      set({
        error: err.response?.data?.detail || "Failed to fetch users",
        loading: false,
        users: [],
        pagination: null,
      });
    }
  },

  fetchUsersByRole: async (role: string) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(UserApi.getUsersByRole, {
        params: { role },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle nested response structure
      const usersData = res.data.data || res.data.results || res.data;

      // Filter out deleted users
      const activeUsers = Array.isArray(usersData)
        ? usersData.filter((user: UserData) => !user.is_deleted)
        : [];

      set({ users: activeUsers, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch users by role",
        loading: false,
        users: [],
      });
    }
  },

  getUser: async (id: number | string) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(UserApi.getUser(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ currentUser: res.data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch user",
        loading: false,
      });
    }
  },

  createUser: async (userData: Partial<UserData>, currentUserRole: string) => {
    set({ loading: true, error: null });

    // Check permission
    if (!get().canAddRole(currentUserRole, userData.role || "")) {
      set({
        error: `You don't have permission to add ${userData.role} users`,
        loading: false,
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(UserApi.createUser, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle nested response structure
      const newUser = res.data.data || res.data;

      // Add new user to the list
      set((state) => ({
        users: [...state.users, newUser],
        loading: false,
      }));
    } catch (err: any) {
      // Handle validation errors from Django
      const errorData = err.response?.data;
      let errorMessage = "Failed to create user";

      if (errorData?.errors) {
        // Format: { errors: { password: ["error1", "error2"], ... } }
        const errors = errorData.errors;
        const errorMessages: string[] = [];
        
        Object.keys(errors).forEach((field) => {
          const fieldErrors = errors[field];
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach((msg) => errorMessages.push(`${field}: ${msg}`));
          }
        });
        
        errorMessage = errorMessages.join("; ");
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }

      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  updateUser: async (id: number | string, userData: Partial<UserData>) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(UserApi.updateUser(id), userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update user in the list
      set((state) => ({
        users: state.users.map((user) => (user.id === id ? res.data : user)),
        loading: false,
      }));
    } catch (err: any) {
      // Handle validation errors from Django
      const errorData = err.response?.data;
      let errorMessage = "Failed to update user";

      if (errorData?.errors) {
        // Format: { errors: { password: ["error1", "error2"], ... } }
        const errors = errorData.errors;
        const errorMessages: string[] = [];
        
        Object.keys(errors).forEach((field) => {
          const fieldErrors = errors[field];
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach((msg) => errorMessages.push(`${field}: ${msg}`));
          }
        });
        
        errorMessage = errorMessages.join("; ");
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }

      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  patchUser: async (id: number | string, userData: Partial<UserData>) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(UserApi.patchUser(id), userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update user in the list
      set((state) => ({
        users: state.users.map((user) => (user.id === id ? res.data : user)),
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to patch user",
        loading: false,
      });
    }
  },

  deleteUser: async (id: number | string) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      await axios.delete(UserApi.deleteUser(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Remove user from the list
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        loading: false,
      }));
    } catch (err: any) {
      console.error("Delete user error:", err.response?.data);
      set({
        error:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete user",
        loading: false,
      });
    }
  },

  activateUser: async (id: number | string) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        UserApi.activateUser(id),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Update user status in the list
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, is_active: true } : user,
        ),
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to activate user",
        loading: false,
      });
    }
  },

  deactivateUser: async (id: number | string) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        UserApi.deactivateUser(id),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Update user status in the list
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, is_active: false } : user,
        ),
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to deactivate user",
        loading: false,
      });
    }
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        UserApi.changePassword,
        {
          old_password: oldPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      set({ loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to change password",
        loading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
