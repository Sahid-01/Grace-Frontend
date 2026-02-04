import { create } from "zustand";
import axios from "axios";
import { StudentProfileApi } from "@/Endpoints/Profile";

export interface StudentProfileData {
  id: number;
  user: number;
  grade_level?: string;
  roll_number?: string;
  admission_date?: string;
  father_name?: string;
  mother_name?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  current_gpa?: string;
  attendance_percentage?: string;
  previous_school?: string;
  medical_conditions?: string;
  extracurricular_activities?: string;
  created_at?: string;
  updated_at?: string;
}

interface StudentProfileState {
  profiles: StudentProfileData[];
  loading: boolean;
  error: string | null;
  currentProfile: StudentProfileData | null;
  
  fetchStudentProfiles: () => Promise<void>;
  getStudentProfile: (id: number | string) => Promise<void>;
  createStudentProfile: (profileData: Partial<StudentProfileData>) => Promise<void>;
  updateStudentProfile: (id: number | string, profileData: Partial<StudentProfileData>) => Promise<void>;
  patchStudentProfile: (id: number | string, profileData: Partial<StudentProfileData>) => Promise<void>;
  deleteStudentProfile: (id: number | string) => Promise<void>;
  getStudentsByGrade: (grade?: string) => Promise<void>;
  clearError: () => void;
}

export const useStudentProfileStore = create<StudentProfileState>()((set) => ({
  profiles: [],
  loading: false,
  error: null,
  currentProfile: null,

  fetchStudentProfiles: async () => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(StudentProfileApi.fetchStudentProfiles, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const profilesData = res.data.data || res.data.results || res.data;
      
      set({ profiles: Array.isArray(profilesData) ? profilesData : [], loading: false });
    } catch (err: any) {
      console.error("Fetch Student Profiles Error:", err.response?.data);
      set({
        error: err.response?.data?.detail || "Failed to fetch student profiles",
        loading: false,
        profiles: [],
      });
    }
  },

  getStudentProfile: async (id: number | string) => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(StudentProfileApi.getStudentProfile(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const profileData = res.data.data || res.data;
      set({ currentProfile: profileData, loading: false });
    } catch (err: any) {
      console.log("Student profile not found:", err.response?.status);
      set({
        error: err.response?.data?.detail || "Failed to fetch student profile",
        loading: false,
        currentProfile: null,
      });
    }
  },

  createStudentProfile: async (profileData: Partial<StudentProfileData>) => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(StudentProfileApi.createStudentProfile, profileData, {
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
        error: err.response?.data?.detail || err.response?.data?.message || "Failed to create student profile",
        loading: false,
      });
    }
  },

  updateStudentProfile: async (id: number | string, profileData: Partial<StudentProfileData>) => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(StudentProfileApi.updateStudentProfile(id), profileData, {
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
        error: err.response?.data?.detail || "Failed to update student profile",
        loading: false,
      });
    }
  },

  patchStudentProfile: async (id: number | string, profileData: Partial<StudentProfileData>) => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(StudentProfileApi.patchStudentProfile(id), profileData, {
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
        error: err.response?.data?.detail || "Failed to patch student profile",
        loading: false,
      });
    }
  },

  deleteStudentProfile: async (id: number | string) => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(StudentProfileApi.deleteStudentProfile(id), {
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
        error: err.response?.data?.detail || err.response?.data?.message || "Failed to delete student profile",
        loading: false,
      });
    }
  },

  getStudentsByGrade: async (grade?: string) => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem("token");
      const url = grade 
        ? `${StudentProfileApi.getStudentsByGrade}?grade=${grade}`
        : StudentProfileApi.getStudentsByGrade;
        
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const profilesData = res.data.data || res.data.results || res.data;
      
      set({ profiles: Array.isArray(profilesData) ? profilesData : [], loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch students by grade",
        loading: false,
        profiles: [],
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
