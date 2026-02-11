import { create } from "zustand";
import axios from "axios";
import { studentProfileAPI } from "@/Endpoints/Profile";

export interface StudentProfile {
  id: number;
  user: number;
  grade_level: string;
  roll_number?: string;
  admission_date: string;
  father_name: string;
  mother_name: string;
  guardian_name?: string;
  guardian_phone: string;
  guardian_email?: string;
  current_gpa?: number;
  attendance_percentage?: number;
  previous_school?: string;
  medical_conditions?: string;
  extracurricular_activities?: string;
}

interface StudentProfileState {
  profiles: StudentProfile[];
  loading: boolean;
  error: string | null;
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
  fetchProfiles: (page?: number, perPage?: number) => Promise<void>;
  fetchProfileById: (id: number) => Promise<StudentProfile | null>;
  fetchByGrade: (grade: string) => Promise<StudentProfile[]>;
  createProfile: (data: Partial<StudentProfile>) => Promise<void>;
  createOwnProfile: (data?: Partial<StudentProfile>) => Promise<void>;
  updateProfile: (id: number, data: Partial<StudentProfile>) => Promise<void>;
  deleteProfile: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useStudentProfileStore = create<StudentProfileState>()(
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
        const res = await axios.get(studentProfileAPI.list, {
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
            err.response?.data?.message || "Failed to fetch student profiles",
          loading: false,
        });
      }
    },

    fetchProfileById: async (id: number) => {
      set({ loading: true, error: null });
      try {
        const res = await axios.get(studentProfileAPI.detail(id));
        set({ loading: false });
        return res.data.data || res.data;
      } catch (err: any) {
        set({
          error:
            err.response?.data?.message || "Failed to fetch student profile",
          loading: false,
        });
        return null;
      }
    },

    fetchByGrade: async (grade: string) => {
      set({ loading: true, error: null });
      try {
        const res = await axios.get(studentProfileAPI.byGrade(grade));
        set({ loading: false });
        return res.data.data || res.data.results || [];
      } catch (err: any) {
        set({
          error:
            err.response?.data?.message || "Failed to fetch students by grade",
          loading: false,
        });
        return [];
      }
    },

    createProfile: async (data: Partial<StudentProfile>) => {
      set({ loading: true, error: null });
      try {
        await axios.post(studentProfileAPI.create, data);
        set({ loading: false });
        await get().fetchProfiles();
      } catch (err: any) {
        set({
          error:
            err.response?.data?.message || "Failed to create student profile",
          loading: false,
        });
        throw err;
      }
    },

    createOwnProfile: async (data: Partial<StudentProfile> = {}) => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        await axios.post(studentProfileAPI.createOwn, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        set({ loading: false });
        await get().fetchProfiles();
      } catch (err: any) {
        set({
          error: err.response?.data?.message || "Failed to create your profile",
          loading: false,
        });
        throw err;
      }
    },

    updateProfile: async (id: number, data: Partial<StudentProfile>) => {
      set({ loading: true, error: null });
      try {
        await axios.patch(studentProfileAPI.update(id), data);
        set({ loading: false });
        await get().fetchProfiles();
      } catch (err: any) {
        set({
          error:
            err.response?.data?.message || "Failed to update student profile",
          loading: false,
        });
        throw err;
      }
    },

    deleteProfile: async (id: number) => {
      set({ loading: true, error: null });
      try {
        await axios.delete(studentProfileAPI.delete(id));
        set({ loading: false });
        await get().fetchProfiles();
      } catch (err: any) {
        set({
          error:
            err.response?.data?.message || "Failed to delete student profile",
          loading: false,
        });
        throw err;
      }
    },

    clearError: () => set({ error: null }),
  }),
);
