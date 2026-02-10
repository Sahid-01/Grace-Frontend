import { create } from "zustand";
import axios from "axios";
import { teacherProfileAPI } from "@/Endpoints/Profile";

export interface TeacherProfile {
  id: number;
  user: number;
  employee_code?: string;
  department: string;
  subject_specialization: string;
  qualification: string;
  experience_years: number;
  hire_date: string;
  salary?: number;
  employment_type: "full_time" | "part_time" | "contract";
  classes_assigned?: string;
  subjects_teaching?: string;
  certifications?: string;
  training_completed?: string;
}

interface TeacherProfileState {
  profiles: TeacherProfile[];
  loading: boolean;
  error: string | null;
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
  fetchProfiles: (page?: number, perPage?: number) => Promise<void>;
  fetchProfileById: (id: number) => Promise<TeacherProfile | null>;
  fetchBySubject: (subject: string) => Promise<TeacherProfile[]>;
  createProfile: (data: Partial<TeacherProfile>) => Promise<void>;
  updateProfile: (id: number, data: Partial<TeacherProfile>) => Promise<void>;
  deleteProfile: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useTeacherProfileStore = create<TeacherProfileState>()(
  (set, get) => ({
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
        const res = await axios.get(teacherProfileAPI.list, {
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
          error:
            err.response?.data?.message || "Failed to fetch teacher profiles",
          loading: false,
        });
      }
    },

    fetchProfileById: async (id: number) => {
      set({ loading: true, error: null });
      try {
        const res = await axios.get(teacherProfileAPI.detail(id));
        set({ loading: false });
        return res.data.data || res.data;
      } catch (err: any) {
        set({
          error:
            err.response?.data?.message || "Failed to fetch teacher profile",
          loading: false,
        });
        return null;
      }
    },

    fetchBySubject: async (subject: string) => {
      set({ loading: true, error: null });
      try {
        const res = await axios.get(teacherProfileAPI.bySubject(subject));
        set({ loading: false });
        return res.data.data || res.data.results || [];
      } catch (err: any) {
        set({
          error:
            err.response?.data?.message ||
            "Failed to fetch teachers by subject",
          loading: false,
        });
        return [];
      }
    },

    createProfile: async (data: Partial<TeacherProfile>) => {
      set({ loading: true, error: null });
      try {
        await axios.post(teacherProfileAPI.create, data);
        set({ loading: false });
        await get().fetchProfiles();
      } catch (err: any) {
        set({
          error:
            err.response?.data?.message || "Failed to create teacher profile",
          loading: false,
        });
        throw err;
      }
    },

    updateProfile: async (id: number, data: Partial<TeacherProfile>) => {
      set({ loading: true, error: null });
      try {
        await axios.patch(teacherProfileAPI.update(id), data);
        set({ loading: false });
        await get().fetchProfiles();
      } catch (err: any) {
        set({
          error:
            err.response?.data?.message || "Failed to update teacher profile",
          loading: false,
        });
        throw err;
      }
    },

    deleteProfile: async (id: number) => {
      set({ loading: true, error: null });
      try {
        await axios.delete(teacherProfileAPI.delete(id));
        set({ loading: false });
        await get().fetchProfiles();
      } catch (err: any) {
        set({
          error:
            err.response?.data?.message || "Failed to delete teacher profile",
          loading: false,
        });
        throw err;
      }
    },

    clearError: () => set({ error: null }),
  }),
);
