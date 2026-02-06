import { create } from "zustand";
import axios from "axios";
import { CourseApi } from "@/Endpoints/Classes/Course";

export interface CourseData {
  id: number;
  title: string;
  description: string;
  course_type: "IELTS" | "PTE";
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  deleted_at?: string | null;
}

interface CoursesState {
  courses: CourseData[];
  loading: boolean;
  error: string | null;
  currentCourse: CourseData | null;

  fetchCourses: () => Promise<void>;
  getCourse: (id: number | string) => Promise<void>;
  createCourse: (courseData: Partial<CourseData>) => Promise<void>;
  updateCourse: (
    id: number | string,
    courseData: Partial<CourseData>,
  ) => Promise<void>;
  patchCourse: (
    id: number | string,
    courseData: Partial<CourseData>,
  ) => Promise<void>;
  deleteCourse: (id: number | string) => Promise<void>;
  clearError: () => void;
}

export const useCoursesStore = create<CoursesState>()((set) => ({
  courses: [],
  loading: false,
  error: null,
  currentCourse: null,

  fetchCourses: async () => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(CourseApi.fetchCourses, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const coursesData = res.data.data || res.data.results || res.data;

      set({
        courses: Array.isArray(coursesData) ? coursesData : [],
        loading: false,
      });
    } catch (err: any) {
      console.error("Fetch Courses Error:", err.response?.data);
      set({
        error: err.response?.data?.detail || "Failed to fetch courses",
        loading: false,
        courses: [],
      });
    }
  },

  getCourse: async (id: number | string) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(CourseApi.getCourse(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const courseData = res.data.data || res.data;
      set({ currentCourse: courseData, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch course",
        loading: false,
        currentCourse: null,
      });
    }
  },

  createCourse: async (courseData: Partial<CourseData>) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(CourseApi.createCourse, courseData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newCourse = res.data.data || res.data;

      set((state) => ({
        courses: [...state.courses, newCourse],
        loading: false,
      }));
    } catch (err: any) {
      set({
        error:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to create course",
        loading: false,
      });
    }
  },

  updateCourse: async (
    id: number | string,
    courseData: Partial<CourseData>,
  ) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(CourseApi.updateCourse(id), courseData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedCourse = res.data.data || res.data;

      set((state) => ({
        courses: state.courses.map((course) =>
          course.id === id ? updatedCourse : course,
        ),
        currentCourse:
          state.currentCourse?.id === id ? updatedCourse : state.currentCourse,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to update course",
        loading: false,
      });
    }
  },

  patchCourse: async (id: number | string, courseData: Partial<CourseData>) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(CourseApi.patchCourse(id), courseData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedCourse = res.data.data || res.data;

      set((state) => ({
        courses: state.courses.map((course) =>
          course.id === id ? updatedCourse : course,
        ),
        currentCourse:
          state.currentCourse?.id === id ? updatedCourse : state.currentCourse,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to patch course",
        loading: false,
      });
    }
  },

  deleteCourse: async (id: number | string) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      await axios.delete(CourseApi.deleteCourse(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set((state) => ({
        courses: state.courses.filter((course) => course.id !== id),
        currentCourse:
          state.currentCourse?.id === id ? null : state.currentCourse,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete course",
        loading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
