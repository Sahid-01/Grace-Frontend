import { create } from "zustand";
import axios from "axios";
import { UserProfileApi } from "@/Endpoints/Profile";

export interface UserProfileData {
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
  is_active_profile?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface UserProfileState {
  profiles: UserProfileData[];
  loading: boolean;
  error: string | null;
  currentProfile: UserProfileData | null;
  
  fetchUserProfiles: () => Promise<void>;
  getUserProfile: (id: number | string) => Promise<void>;
  createUserProfile: (profileData: Partial<UserProfileData>) => Promise<void>;
  updateUserProfile: (id: number | string, profileData: Partial<UserProfileData>) => Promise<void>;
  patchUserProfile: (id: number | string, profileData: Partial<UserProfileData>) => Promise<void>;
  deleteUserProfile: (id: number | string) => Promise<void>;
  clearError: () => void;
}

export const useUserProfileStore = create<UserProfileState>()((set) => ({
  profiles: [],
  loading: false,
  error: null,
  currentProfile: null,

  fetchUserProfiles: async () => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(UserProfileApi.fetchUserProfiles, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const profilesData = res.data.data || res.data.results || res.data;
      
      set({ profiles: Array.isArray(profilesData) ? profilesData : [], loading: false });
    } catch (err: any) {
      console.error("Fetch User Profiles Error:", err.response?.data);
      set({
        error: err.response?.data?.detail || "Failed to fetch user profiles",
        loading: false,
        profiles: [],
      });
    }
  },

  getUserProfile: async (id: number | string) => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(UserProfileApi.getUserProfile(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const profileData = res.data.data || res.data;
      set({ currentProfile: profileData, loading: false });
    } catch (err: any) {
      console.log("User profile not found:", err.response?.status);
      set({
        error: err.response?.data?.detail || "Failed to fetch user profile",
        loading: false,
        currentProfile: null,
      });
    }
  },

  createUserProfile: async (profileData: Partial<UserProfileData>) => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(UserProfileApi.createUserProfile, profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const newProfile = res.data.data || res.data;
      
      set((state) => ({
        profiles: [...state.profiles, newProfile],
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || err.response?.data?.message || "Failed to create user profile",
        loading: false,
      });
    }
  },

  updateUserProfile: async (id: number | string, profileData: Partial<UserProfileData>) => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(UserProfileApi.updateUserProfile(id), profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const updatedProfile = res.data.data || res.data;
      
      set((state) => ({
        profiles: state.profiles.map((profile) => 
          profile.id === id ? updatedProfile : profile
        ),
        currentProfile: state.currentProfile?.id === id ? updatedProfile : state.currentProfile,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to update user profile",
        loading: false,
      });
    }
  },

  patchUserProfile: async (id: number | string, profileData: Partial<UserProfileData>) => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(UserProfileApi.patchUserProfile(id), profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const updatedProfile = res.data.data || res.data;
      
      set((state) => ({
        profiles: state.profiles.map((profile) => 
          profile.id === id ? updatedProfile : profile
        ),
        currentProfile: state.currentProfile?.id === id ? updatedProfile : state.currentProfile,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to patch user profile",
        loading: false,
      });
    }
  },

  deleteUserProfile: async (id: number | string) => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(UserProfileApi.deleteUserProfile(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      set((state) => ({
        profiles: state.profiles.filter((profile) => profile.id !== id),
        currentProfile: state.currentProfile?.id === id ? null : state.currentProfile,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || err.response?.data?.message || "Failed to delete user profile",
        loading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
