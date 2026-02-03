import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  name?: string;
  full_name?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token: string, user: User) => {
        // console.log('Auth store login called with:', { token, user })
        localStorage.setItem("authToken", token);
        // console.log('Token stored in localStorage:', localStorage.getItem('authToken'))
        set({ token, user, isAuthenticated: true });
        // console.log('Auth store updated')
      },
      logout: () => {
        localStorage.removeItem("authToken");
        set({ token: null, user: null, isAuthenticated: false });
      },
      setUser: (user: User) => set({ user }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        // Check if token exists in localStorage and update isAuthenticated
        if (state) {
          const token = localStorage.getItem("authToken");
          if (token && state.user) {
            state.isAuthenticated = true;
            state.token = token;
          } else if (!token) {
            state.isAuthenticated = false;
            state.token = null;
            state.user = null;
          }
        }
      },
    },
  ),
);
