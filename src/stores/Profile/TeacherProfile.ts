import { create } from "zustand";
import axios from "axios";
import { TeacherProfileApi } from "@/Endpoints/Profile";

export interface TeacherProfileData {
  id: number;
  user: number;
  employee_code?: string;
  department?: string;
  subject_specialization?: string;
  qualification?: string;
  experience_years?: number;
  hire_date?: string;
  salary?: string;
  employment_type?: "full_time" | "part_time" | "contract";
  classes_assigned?: string;
  subjects_teaching?: string;
  certifications?: string;
  training_completed?: string;
  created_at?: string;
  updated_at?: string;
}

interface TeacherProfileState {
  profiles: TeacherProfileData[];
  loading: boolean;
  error: string | null;
  currentProfile: TeacherProfileData | null;

  fetchTeacherProfiles: () => Promise<void>;
  getTeacherProfile: (id: number | string) => Promise<void>;
  createTeacherProfile: (
    profileData: Partial<TeacherProfileData>,
  ) => Promise<void>;
  updateTeacherProfile: (
    id: number | string,
    profileData: Partial<TeacherProfileData>,
  ) => Promise<void>;
  patchTeacherProfile: (
    id: number | string,
    profileData: Partial<TeacherProfileData>,
  ) => Promise<void>;
  deleteTeacherProfile: (id: number | string) => Promise<void>;
  getTeachersBySubject: (subject?: string) => Promise<void>;
  clearError: () => void;
}

export const useTeacherProfileStore = create<TeacherProfileState>()((set) => ({
  profiles: [],
  loading: false,
  error: null,
  currentProfile: null,

  fetchTeacherProfiles: async () => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(TeacherProfileApi.fetchTeacherProfiles, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profilesData = res.data.data || res.data.results || res.data;

      set({
        profiles: Array.isArray(profilesData) ? profilesData : [],
        loading: false,
      });
    } catch (err: any) {
      console.error("Fetch Teacher Profiles Error:", err.response?.data);
      set({
        error: err.response?.data?.detail || "Failed to fetch teacher profiles",
        loading: false,
        profiles: [],
      });
    }
  },

  getTeacherProfile: async (id: number | string) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(TeacherProfileApi.getTeacherProfile(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profileData = res.data.data || res.data;
      set({ currentProfile: profileData, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch teacher profile",
        loading: false,
        currentProfile: null,
      });
    }
  },

  createTeacherProfile: async (profileData: Partial<TeacherProfileData>) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        TeacherProfileApi.createTeacherProfile,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const newProfile = res.data.data || res.data;

      set((state) => ({
        profiles: [...state.profiles, newProfile],
        loading: false,
      }));
    } catch (err: any) {
      set({
        error:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to create teacher profile",
        loading: false,
      });
    }
  },

  updateTeacherProfile: async (
    id: number | string,
    profileData: Partial<TeacherProfileData>,
  ) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        TeacherProfileApi.updateTeacherProfile(id),
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedProfile = res.data.data || res.data;

      set((state) => ({
        profiles: state.profiles.map((profile) =>
          profile.id === id ? updatedProfile : profile,
        ),
        currentProfile:
          state.currentProfile?.id === id
            ? updatedProfile
            : state.currentProfile,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to update teacher profile",
        loading: false,
      });
    }
  },

  patchTeacherProfile: async (
    id: number | string,
    profileData: Partial<TeacherProfileData>,
  ) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        TeacherProfileApi.patchTeacherProfile(id),
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedProfile = res.data.data || res.data;

      set((state) => ({
        profiles: state.profiles.map((profile) =>
          profile.id === id ? updatedProfile : profile,
        ),
        currentProfile:
          state.currentProfile?.id === id
            ? updatedProfile
            : state.currentProfile,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to patch teacher profile",
        loading: false,
      });
    }
  },

  deleteTeacherProfile: async (id: number | string) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      await axios.delete(TeacherProfileApi.deleteTeacherProfile(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set((state) => ({
        profiles: state.profiles.filter((profile) => profile.id !== id),
        currentProfile:
          state.currentProfile?.id === id ? null : state.currentProfile,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete teacher profile",
        loading: false,
      });
    }
  },

  getTeachersBySubject: async (subject?: string) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const url = subject
        ? `${TeacherProfileApi.getTeachersBySubject}?subject=${subject}`
        : TeacherProfileApi.getTeachersBySubject;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profilesData = res.data.data || res.data.results || res.data;

      set({
        profiles: Array.isArray(profilesData) ? profilesData : [],
        loading: false,
      });
    } catch (err: any) {
      set({
        error:
          err.response?.data?.detail || "Failed to fetch teachers by subject",
        loading: false,
        profiles: [],
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
