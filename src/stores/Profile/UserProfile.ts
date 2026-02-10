import { create } from "zustand";
import axios from "axios";
import { userProfileAPI } from "@/Endpoints/Profile";

export interface UserProfile {
  id: number;
  user: number;
  bio?: string;
  birth_date?: string;
  profile_picture?: string;
  phone_number?: string;
  address?: string;
  emergency_contact?: string;
  join_date?: string;
  nationality?: string;
  blood_group?: string;
  facebook_url?: string;
  linkedin_url?: string;
  is_active_profile: boolean;
}

interface UserProfileState {
  profiles: UserProfile[];
  loading: boolean;
  error: string | null;
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
  fetchProfiles: (page?: number, perPage?: number) => Promise<void>;
  fetchProfileById: (id: number) => Promise<UserProfile | null>;
  createProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateProfile: (id: number, data: Partial<UserProfile>) => Promise<void>;
  deleteProfile: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useUserProfileStore = create<UserProfileState>()((set, get) => ({
  profiles: [],
  loading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },

  fetchProfiles: async (page = 1, perPage = 10) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(userProfileAPI.list, {
        params: { page, per_page: perPage },
      });
      set({
        profiles: res.data.data || res.data.results || [],
        pagination: {
          count: res.data.meta?.total || res.data.count || 0,
          next: res.data.next || null,
          previous: res.data.previous || null,
        },
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch profiles",
        loading: false,
      });
    }
  },

  fetchProfileById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(userProfileAPI.detail(id));
      set({ loading: false });
      return res.data.data || res.data;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch profile",
        loading: false,
      });
      return null;
    }
  },

  createProfile: async (data: Partial<UserProfile>) => {
    set({ loading: true, error: null });
    try {
      await axios.post(userProfileAPI.create, data);
      set({ loading: false });
      await get().fetchProfiles();
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to create profile",
        loading: false,
      });
      throw err;
    }
  },

  updateProfile: async (id: number, data: Partial<UserProfile>) => {
    set({ loading: true, error: null });
    try {
      await axios.patch(userProfileAPI.update(id), data);
      set({ loading: false });
      await get().fetchProfiles();
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to update profile",
        loading: false,
      });
      throw err;
    }
  },

  deleteProfile: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(userProfileAPI.delete(id));
      set({ loading: false });
      await get().fetchProfiles();
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to delete profile",
        loading: false,
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
